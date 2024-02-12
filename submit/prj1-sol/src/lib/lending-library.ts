import { Errors } from 'cs544-js-utils';

/** Note that errors are documented using the `code` option which must be
 *  returned (the `message` can be any suitable string which describes
 *  the error as specifically as possible).  Whenever possible, the
 *  error should also contain a `widget` option specifying the widget
 *  responsible for the error).
 *
 *  Note also that none of the function implementations should normally
 *  require a sequential scan over all books or patrons.
 */

/******************** Types for Validated Requests *********************/

/** used as an ID for a book */
type ISBN = string; 

/** used as an ID for a library patron */
type PatronId = string;

export type Book = {
  isbn: ISBN;
  title: string;
  authors: string[];
  pages: number;      //must be int > 0
  year: number;       //must be int > 0
  publisher: string;
  nCopies?: number;   //# of copies owned by library; not affected by borrows;
                      //must be int > 0; defaults to 1
};

export type XBook = Required<Book>;

type AddBookReq = Book;
type FindBooksReq = { search: string; };
type ReturnBookReq = { patronId: PatronId; isbn: ISBN; };
type CheckoutBookReq = { patronId: PatronId; isbn: ISBN; };

/************************ Main Implementation **************************/

export function makeLendingLibrary() {
  return new LendingLibrary();
}

export class LendingLibrary {

  private idToBook: Record<ISBN, XBook>;
  private wordToId: Record<string, ISBN[]>;
  private bookToPatrons: Record<ISBN, PatronId[]>;
  private patronToBooks: Record<PatronId, ISBN[]>;
  
  //TODO: declare private TS properties for instance
  
  constructor() {
    //TODO: initialize private TS properties for instance
    this.idToBook = {};
    this.wordToId = {};
    this.bookToPatrons = {};
    this.patronToBooks = {};
    
  }

  booksEqual(book1: Book, book2: Book): boolean {
     if(book1.isbn === book2.isbn && (book1.authors.length == book2.authors.length && book1.authors.every((V,i) => V == book2.authors[i])) && book1.title == book2.title && book1.pages == book2.pages && book1.year == book2.year && book1.publisher == book2.publisher){
     		   return true;
     }
     return false;
  }

  /** Add one-or-more copies of book represented by req to this library.
   *
   *  Errors:
   *    MISSING: one-or-more of the required fields is missing.
   *    BAD_TYPE: one-or-more fields have the incorrect type.
   *    BAD_REQ: other issues like nCopies not a positive integer 
   *             or book is already in library but data in obj is 
   *             inconsistent with the data already present.
   */
  addBook(req: Record<string, any>): Errors.Result<XBook> {
    //TODO
 

    if(typeof req.title === "undefined"){
    	  return Errors.errResult('error', 'MISSING', 'title');
    }else if(typeof req.title !== "string"){
    	  return Errors.errResult('error', 'BAD_TYPE', 'title');
    }

    //console.log(req.authors);
    //console.log(typeof req.authors == typeof []);

    if(typeof req.authors === "undefined"){
    	  return Errors.errResult('error', 'MISSING', 'authors');
    }else if((typeof req.authors !== typeof []) || req.authors.length <= 0){
    	  return Errors.errResult('error', 'BAD_TYPE', 'authors');
    }else{
	for(var e of req.authors){
		if(typeof e !== "string"){
			  return Errors.errResult('error', 'BAD_TYPE', 'authors');
		}
	}
    }

    if(typeof req.isbn === "undefined"){
    	  return Errors.errResult('error', 'MISSING', 'isbn');
    } else if(typeof req.isbn !== "string"){
      	  return Errors.errResult('error', 'BAD_TYPE', 'isbn');
    }

    if(typeof req.pages === "undefined"){
    	  return Errors.errResult('error', 'MISSING', 'pages');
    } else if(typeof req.pages !== "number"){
      	  return Errors.errResult('error', 'BAD_TYPE', 'pages');
    }

    if(typeof req.year === "undefined"){
    	  return Errors.errResult('error', 'MISSING', 'year');
    } else if(typeof req.year !== "number"){
      	  return Errors.errResult('error', 'BAD_TYPE', 'year');
    }

    if(typeof req.publisher === "undefined"){
    	  return Errors.errResult('error', 'MISSING', 'publisher');
    } else if(typeof req.publisher !== "string"){
    	  return Errors.errResult('error', 'BAD_TYPE', 'publisher');
    }

    var newbook: XBook = {
    	     isbn: req.isbn,
	     title: req.title,
	     authors: req.authors,
	     pages: req.pages,
	     publisher: req.publisher,
	     year: req.year,
	     nCopies: 1
    };
    //console.log(req.nCopies);
    if(typeof req.nCopies === "number"){
    	//console.log("number");
    	if(req.nCopies <= 0 || !Number.isInteger(req.nCopies)){
	    return Errors.errResult('error', 'BAD_REQ', 'nCopies');
	}
    	newbook.nCopies = req.nCopies;
    }else if(typeof req.nCopies !== "undefined"){
    	  //console.log("not number");
    	  return Errors.errResult('error', 'BAD_TYPE', 'nCopies');
    }
    if(typeof this.idToBook[req.isbn] === "undefined"){
	for(const x of req.title.split(/[ ]+/)){
	     if(typeof this.wordToId[x] == "undefined"){
	         this.wordToId[x] = [req.isbn];
	     }else if(!this.wordToId[x].includes(req.isbn)){
		 this.wordToId[x].push(req.isbn);
	     }
	}
	this.idToBook[req.isbn] = newbook;
    
    } else{
	if(this.booksEqual(this.idToBook[req.isbn], newbook)){
	    this.idToBook[req.isbn].nCopies = this.idToBook[req.isbn].nCopies + newbook.nCopies;
	    newbook = this.idToBook[req.isbn];
	} else {
	    return Errors.errResult('error', 'BAD_REQ');
	}
    }



    return Errors.okResult(newbook);  //placeholder
  }

  /** Return all books matching (case-insensitive) all "words" in
   *  req.search, where a "word" is a max sequence of /\w/ of length > 1.
   *  Returned books should be sorted in ascending order by title.
   *
   *  Errors:
   *    MISSING: search field is missing
   *    BAD_TYPE: search field is not a string.
   *    BAD_REQ: no words in search
   */
  findBooks(req: Record<string, any>) : Errors.Result<XBook[]> {
    //TODO
    return Errors.errResult('TODO');  //placeholder
  }


  /** Set up patron req.patronId to check out book req.isbn. 
   * 
   *  Errors:
   *    MISSING: patronId or isbn field is missing
   *    BAD_TYPE: patronId or isbn field is not a string.
   *    BAD_REQ error on business rule violation.
   */
  checkoutBook(req: Record<string, any>) : Errors.Result<void> {
    //TODO
    return Errors.errResult('TODO');  //placeholder
  }

  /** Set up patron req.patronId to returns book req.isbn.
   *  
   *  Errors:
   *    MISSING: patronId or isbn field is missing
   *    BAD_TYPE: patronId or isbn field is not a string.
   *    BAD_REQ error on business rule violation.
   */
  returnBook(req: Record<string, any>) : Errors.Result<void> {
    //TODO 
    return Errors.errResult('TODO');  //placeholder
  }
  
}


/********************** Domain Utility Functions ***********************/


//TODO: add domain-specific utility functions or classes.

/********************* General Utility Functions ***********************/

//TODO: add general utility functions or classes.

