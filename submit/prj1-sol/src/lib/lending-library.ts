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
 
    var errorcheck: Errors.Result<XBook> = verifyReq(req);
    if(errorcheck.isOk === false){
        return errorcheck;
    }

    var newbook: XBook = errorcheck.val;
    
    
    if(typeof this.idToBook[newbook.isbn] === "undefined"){
    	var wordsDivided: string[] = divideString(newbook.title, newbook.authors);
	for(const x of wordsDivided){
	     if(x.length <= 1){
	         continue;
	     }
	     if(typeof this.wordToId[x.toLowerCase()] == "undefined"){
	         this.wordToId[x.toLowerCase()] = [newbook.isbn];
	     }else if(!this.wordToId[x.toLowerCase()].includes(req.isbn)){
		 this.wordToId[x.toLowerCase()].push(newbook.isbn);
	     }
	}
	this.idToBook[newbook.isbn] = newbook;
    
    } else{
	let errorEq: Errors.Result<void> = booksEqual(this.idToBook[newbook.isbn], newbook);
	if(errorEq.isOk === false){
	    return errorEq;
	}
	this.idToBook[newbook.isbn].nCopies = this.idToBook[newbook.isbn].nCopies + newbook.nCopies;
	newbook = this.idToBook[newbook.isbn];
    }


    //console.log(this.wordToId);
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

    if(typeof req.search !== "string"){
    	      return Errors.errResult('property search must be of type string', 'BAD_TYPE', 'search');
    }

    var it: string[] = divideString(req.search);
    //console.log(it);
    //var it: string[] = [];
    

    /*for(const x of it_split){
        if(x.length > 1){
	    it.push(x);
	}
    }*/

    //console.log(it);


    
    if(it.length === 0){
        return Errors.errResult('search string must contain 1+ words of length > 1', 'BAD_REQ', 'search');
    }

    //var words: number = 0;

    var start: boolean = false;
    var arr: string[] = [];
    for(const x of it){
    	/*if(x.length <= 1){
	    continue;
	}*/
	//words++;
    	//console.log(arr);
    	/*if(typeof this.wordToId[x.toLowerCase()] === "undefined"){
	       return Errors.errResult('Bad req', 'BAD_REQ', 'search');
	}*/
        if(start === false && typeof this.wordToId[x.toLowerCase()] !== "undefined"){
	       start = true;
	       arr = this.wordToId[x.toLowerCase()];
	}else if(typeof this.wordToId[x.toLowerCase()] !== "undefined"){
	       arr = arr.filter(e => this.wordToId[x.toLowerCase()].includes(e));
	} else {
	       arr = [];
	       break;
	}
    }

    /*if(words <= 0){
        return Errors.errResult('bad req', 'BAD_REQ', 'search');
    }*/

    var ret: XBook[] = [];

    for(const x of arr){
        ret.push(this.idToBook[x]);
    }
    
    return Errors.okResult(ret.sort((x,y)=>x.title.localeCompare(y.title)));  //placeholder
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
    //console.log(this.idToBook);
    //console.log("\n");
    //console.log(req);

    let reqCheck: Errors.Result<void> = verifyPatronReq(req);
    if(reqCheck.isOk === false){
        return reqCheck;
    }
    /*if(typeof req.isbn === "undefined"){
        return Errors.errResult('missing args', 'MISSING', 'isbn');
    }
    if(typeof req.patronId === "undefined"){
        return Errors.errResult('missing args', 'MISSING', 'patronId');
    }*/
    
    if(typeof this.idToBook[req.isbn] === "undefined" /*|| this.idToBook[req.isbn].nCopies <= 0*/){
        return Errors.errResult('unknown book ${req.isbn}', 'BAD_REQ', 'isbn');
    }
    if(this.idToBook[req.isbn].nCopies <= 0){
        return Errors.errResult('no copies of book ${req.isbn} are available', 'BAD_REQ', 'isbn');
    }

    if(typeof this.patronToBooks[req.patronId] === "undefined"){
        this.patronToBooks[req.patronId] = [];
    }

    if(this.patronToBooks[req.patronId].includes(req.isbn)){
	return Errors.errResult('patron ${patronId} already has book ${req.isbn} checked out', 'BAD_REQ', 'isbn');
    }
    this.patronToBooks[req.patronId].push(req.isbn);

    if(typeof this.bookToPatrons[req.isbn] === "undefined"){
        this.bookToPatrons[req.isbn] = [];
    }
    this.bookToPatrons[req.isbn].push(req.patronId);
    this.idToBook[req.isbn].nCopies--;
    


    return Errors.okResult(undefined);  //placeholder
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
    //console.log(req);
    let reqCheck: Errors.Result<void> = verifyPatronReq(req);
    if(reqCheck.isOk === false){
        return reqCheck;
    }
    /*if(typeof req.patronId === "undefined"){
        return Errors.errResult('missing args', 'MISSING', 'patronId');
    }
    if(typeof req.isbn === "undefined"){
        return Errors.errResult('missing args', 'MISSING', 'patronId');
    }*/

    if(typeof this.idToBook[req.isbn] === "undefined"){
        return Errors.errResult('book ${req.isbn} does not exist', 'BAD_REQ', 'isbn');
    }

    if(typeof this.patronToBooks[req.patronId] === "undefined" || this.patronToBooks[req.patronId].indexOf(req.isbn) === -1){
        return Errors.errResult('no checkout of book ${req.isbn} by patron ${req.patronId}', 'BAD_REQ', 'patronId');
    }

    /*if(this.patronToBooks[req.patronId].indexOf(req.isbn) === -1){
        return Errors.errResult('missing book', 'BAD_REQ', 'patronId');
    }*/

    this.patronToBooks[req.patronId] = this.patronToBooks[req.patronId].filter(e => e != req.isbn);
    this.bookToPatrons[req.isbn] = this.bookToPatrons[req.isbn].filter(e => e != req.patronId);
    this.idToBook[req.isbn].nCopies++;
    

    return Errors.okResult(undefined);  //placeholder
  }
  
}


/********************** Domain Utility Functions ***********************/

//TODO: add domain-specific utility functions or classes.

function verifyPatronReq(req: Record<string, any>): Errors.Result<void> {
	 let ret: Errors.ErrResult = new Errors.ErrResult();

	 if(typeof req.isbn === "undefined"){
	     ret = ret.addError(Errors.errResult('property isbn is required', 'MISSING', 'isbn'));
	 } else if(typeof req.isbn !== "string"){
	     ret = ret.addError(Errors.errResult('property isbn must be of type string', 'BAD_TYPE', 'isbn'));
	 }

	 if(typeof req.patronId === "undefined"){
	     ret = ret.addError(Errors.errResult('property patronId is required', 'MISSING', 'patronId'));
	 } else if(typeof req.patronId !== "string"){
	     ret = ret.addError(Errors.errResult('property patronId  must be of type string', 'BAD_TYPE', 'patronId'));
	 }

	 if(ret.errors.length > 0){
	     return ret;
	 }

         return Errors.okResult(undefined);
}

function verifyReq(req: Record<string, any>): Errors.Result<XBook> {
    let errorRet: Errors.ErrResult[] = [];

    if(typeof req.title === "undefined"){
    	  errorRet.push(Errors.errResult('property title is required', 'MISSING', 'title'));
    }else if(typeof req.title !== "string"){
    	  errorRet.push(Errors.errResult('property title must be of type string', 'BAD_TYPE', 'title'));
    }

    //console.log(req.authors);
    //console.log(typeof req.authors == typeof []);

    if(typeof req.authors === "undefined"){
    	  errorRet.push(Errors.errResult('property authors is required', 'MISSING', 'authors'));
    }else if((typeof req.authors !== typeof []) || req.authors.length <= 0){
    	  errorRet.push(Errors.errResult('property authors must be of type string[]', 'BAD_TYPE', 'authors'));
    }else{
	for(var e of req.authors){
		if(typeof e !== "string"){
			  errorRet.push(Errors.errResult('property authors must be of type string[]', 'BAD_TYPE', 'authors'));
		}
	}
    }

    if(typeof req.isbn === "undefined"){
    	  errorRet.push(Errors.errResult('property isbn is required', 'MISSING', 'isbn'));
    } else if(typeof req.isbn !== "string"){
      	  errorRet.push(Errors.errResult('property isbn must be of type string', 'BAD_TYPE', 'isbn'));
    }

    if(typeof req.pages === "undefined"){
    	  errorRet.push(Errors.errResult('property pages is required', 'MISSING', 'pages'));
    } else if(typeof req.pages !== "number"){
      	  errorRet.push(Errors.errResult('property pages must be of type number', 'BAD_TYPE', 'pages'));
    }

    if(typeof req.year === "undefined"){
    	  errorRet.push(Errors.errResult('property year is required', 'MISSING', 'year'));
    } else if(typeof req.year !== "number"){
      	  errorRet.push(Errors.errResult('property year must be of type number', 'BAD_TYPE', 'year'));
    }

    if(typeof req.publisher === "undefined"){
    	  errorRet.push(Errors.errResult('property publisher is required', 'MISSING', 'publisher'));
    } else if(typeof req.publisher !== "string"){
    	  errorRet.push(Errors.errResult('property publisher must be of type string', 'BAD_TYPE', 'publisher'));
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
	    errorRet.push(Errors.errResult('property nCopies must be an integer', 'BAD_REQ', 'nCopies'));
	}
    	newbook.nCopies = req.nCopies;
    }else if(typeof req.nCopies !== "undefined"){
    	  //console.log("not number");
    	  errorRet.push(Errors.errResult('property nCopies must be of type number', 'BAD_TYPE', 'nCopies'));
    }

    let ret: Errors.ErrResult = new Errors.ErrResult();

    if(errorRet.length > 0){
        for(const i of errorRet)
	{
	    //console.log(i);
	    ret = ret.addError(i);
	}
	return ret;
    }
    

    return Errors.okResult(newbook);
    
}

function booksEqual(book1: Book, book2: Book): Errors.Result<void> {
     //if(book1.isbn === book2.isbn && (book1.authors.length == book2.authors.length && book1.authors.every((V,i) => V == book2.authors[i])) && book1.title == book2.title && book1.pages == book2.pages && book1.year == book2.year && book1.publisher == book2.publisher){
     		  // return true;
   //}
    let errorRet: Errors.ErrResult = new Errors.ErrResult();

    if(book1.title !== book2.title){
        errorRet = errorRet.addError(Errors.errResult('inconsistent title data', 'BAD_REQ', 'title'));
    }
    if(book1.authors.length !== book2.authors.length || book1.authors.some((V,i) => V !== book2.authors[i])){
    	errorRet = errorRet.addError(Errors.errResult('inconsistent authors data', 'BAD_REQ', 'authors'));
    }
    if(book1.isbn !== book2.isbn){
        errorRet = errorRet.addError(Errors.errResult('inconsistent isbn data', 'BAD_REQ', 'isbn'));
    }
    if(book1.pages !== book2.pages){
        errorRet = errorRet.addError(Errors.errResult('inconsistent pages data', 'BAD_REQ', 'pages'));
    }
    if(book1.year !== book2.year){
        errorRet = errorRet.addError(Errors.errResult('inconsistent year data', 'BAD_REQ', 'year'));
    }
    if(book1.publisher !== book2.publisher){
        errorRet = errorRet.addError(Errors.errResult('inconsistent publisher data', 'BAD_REQ','year'));
    }

    if(errorRet.errors.length > 0){
        return errorRet;
    }

   return Errors.okResult(undefined);
}



/********************* General Utility Functions ***********************/

//TODO: add general utility functions or classes.

function divideString( x: string, y?: string[]): string[] {
    var ret: string[] = x.split(/[\W ]+/);
    if(typeof y !== "undefined"){
        ret.push(...y);
    }

    return ret.filter(element => element.length > 1);
}