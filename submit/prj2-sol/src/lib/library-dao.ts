import * as mongo from 'mongodb';

import { Errors } from 'cs544-js-utils';

import * as Lib from './library.js';

//TODO: define any DB specific types if necessary

type ISBN = string;
type PatronId = string;

//type books = {isbn: ISBN, book: XBook};
//type wordIsbns = {word: string, books: ISBN[]};
export type patronCheckouts = {patron: PatronId, books: ISBN[]};
//export patronCheckouts;
type bookCheckouts = {book: ISBN, patrons: PatronId[]};
  
export async function makeLibraryDao(dbUrl: string) {
  return await LibraryDao.make(dbUrl);
}

//options for new MongoClient()
const MONGO_OPTIONS = {
  ignoreUndefined: true,  //ignore undefined fields in queries
};


export class LibraryDao {

  //called by below static make() factory function with
  //parameters to be cached in this instance.
  constructor(private readonly client: mongo.MongoClient,
  	      private readonly isbnBooks: mongo.Collection<Lib.XBook>,
	      private readonly patronBooks: mongo.Collection<patronCheckouts>) {
  }

  //static factory function; should do all async operations like
  //getting a connection and creating indexing.  Finally, it
  //should use the constructor to return an instance of this class.
  //returns error code DB on database errors.
  static async make(dbUrl: string) : Promise<Errors.Result<LibraryDao>> {
    try {
      const client = await (new mongo.MongoClient(dbUrl, MONGO_OPTIONS)).connect();
      const db = client.db();
      const isbnBooks = db.collection<Lib.XBook>("XBooks");
      //const wordBooks = db.collection<wordIsbns>("Words");
      await isbnBooks.createIndex({title: "text", authors: "text", });
      const patronBooks = db.collection<patronCheckouts>("Patrons");
      await patronBooks.createIndex({books: "text"});
      //const bookPatrons = db.collection<bookCheckouts>("Books Taken");
      return Errors.okResult(new LibraryDao(client, isbnBooks, patronBooks));
    }
    catch (error) {
      return Errors.errResult(error.message, 'DB');
    }
  }

  /** close off this DAO; implementing object is invalid after 
   *  call to close() 
   *
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async close() : Promise<Errors.Result<void>> {
    try{
	await this.client.close();
	return Errors.VOID_RESULT;
    } catch (error){
        return Errors.errResult(error.message, 'DB');
    }
  }

   async clear() : Promise<Errors.Result<void>> {
    try {
      await this.isbnBooks.deleteMany({});
      await this.patronBooks.deleteMany({});
      return Errors.VOID_RESULT;
    }
    catch (e) {
      return Errors.errResult(e.message, 'DB');
    }
  }

  async hasPatron(patron: PatronId) : Promise<Errors.Result<patronCheckouts>>{
  	try{
		const pat = await this.patronBooks.findOne({patron: patron});
		if(pat){
			return Errors.okResult(pat);
		} else {
		       return Errors.errResult("patron not found", {code: 'NOT_FOUND'});
		}
	} catch (e){
	  return Errors.errResult(e.message, 'DB');
	}
  }

  async has(isbn: ISBN) : Promise<Errors.Result<Lib.XBook>>{
  	try{
		const collection = this.isbnBooks;
		const book = await collection.findOne({isbn: isbn});
		if(book){
			return Errors.okResult(book);
		}else{
			return Errors.errResult('user not found', {code: 'NOT_FOUND'});
		}
	}catch (e){
	       return Errors.errResult(e.message, 'DB');
	}
  }

  async addPatron(patron: PatronId, isbn: ISBN, oldPat?: patronCheckouts) : Promise<Errors.Result<patronCheckouts>>{
  	try{
		let retPat;
		if(typeof oldPat !== "undefined"){
			  oldPat.books.push(isbn);
			  retPat = oldPat;
			  await this.patronBooks.updateOne({patron: patron}, {$set: {books: oldPat.books}});
		}else{
			const newPat: patronCheckouts = {patron: patron, books: [isbn]};
			retPat = newPat;
			await this.patronBooks.insertOne(newPat);
		}
		return Errors.okResult(retPat);
	}catch(e){
		return Errors.errResult(e.message, 'DB');
	}
  }

  async add(book: Lib.XBook, exists: boolean, oldBook?: Lib.XBook) : Promise<Errors.Result<Lib.XBook>>{
  	try{
	let retBook = book;
  	if(exists && typeof oldBook !== "undefined"){
		//const og = await this.has(book.isbn);
		//if(og.isOk === true){
		retBook.nCopies = retBook.nCopies + oldBook.nCopies
		const newCopies = oldBook.nCopies + book.nCopies;
		await this.isbnBooks.updateOne(
		      {isbn: book.isbn},
		      {
			$set: { nCopies: newCopies}
		      }
		);
		//}
	} else {
	  await this.isbnBooks.insertOne(book);
	}
	return Errors.okResult(retBook);
	}catch (e) {
	       return Errors.errResult(e.message, 'DB');
	}
  }

  async search(search: string, count?: number, index?: number): Promise<Errors.Result<Lib.XBook[]>>{
  	try{
		let skip;
		let limit;
		if(typeof index === "undefined"){
			  skip = 0;
		}else{
			skip = index;
		}

		if(typeof count === "undefined"){
			  limit = 0;
		} else {
		          limit = count;
		}
	 
		const x = await this.isbnBooks.find( { $text : {$search: search} } ).sort({title: 1}).project({_id: 0}).skip(skip).limit(limit).toArray();

		return Errors.okResult(x);
	}catch (e){
  	       return Errors.errResult(e.message, 'DB');
	}

  }

async searchIsbn(search: string): Promise<Errors.Result<patronCheckouts[]>>
{
	try{
		//console.log(await this.patronBooks.find({}));
		const x =  await this.patronBooks.find( { $text : {$search: search} }).project({_id: 0}).toArray();
		//console.log("\n\n");
		//console.log(x);
		return Errors.okResult(x as patronCheckouts[]);

	}catch (e){
	       return Errors.errResult(e.message, 'DB');
	}
}

async return(patron: patronCheckouts ) : Promise<Errors.Result<patronCheckouts>>{
      try{
	 await this.patronBooks.updateOne({patron: patron.patron}, {$set: {books: patron.books}});
	 return Errors.okResult(patron);
      }catch(e){
	return Errors.errResult(e.message, 'DB');
      }

}
  //add methods as per your API

  //make method check book
  //make method add/update book using updateOne or

  //for find book with index and count use the $slice function

} //class LibDao


