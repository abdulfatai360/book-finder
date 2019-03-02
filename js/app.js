/* ******** Global variables ******** */

const mainElem = document.querySelector('.main');
const initialMainElemCls = `main container`;
const searchForm = document.querySelector('.search-form');

/* ******** Helper functions and class ******** */

function clientErrHandler() {
  const connStatus = document.querySelector('.conn-status-msg p');
  connStatus.textContent = 'We can not complete your search request at the moment. Please check your network connection and try again';

  mainElem.className = `${initialMainElemCls} state__conn-status`;
  mainElem.classList.remove('state__fetching-books');
}

function slowNetworkErrHandler() {
  return setTimeout(() => {
    const connStatus = document.querySelector('.conn-status-msg p');
    connStatus.textContent = 'Your network connection is slow. Please wait a while longer.';

    mainElem.className = `${initialMainElemCls} state__conn-status`;
    mainElem.classList.add('state__fetching-books');
  }, 3000);
}

function makeBooksRequest(timeoutId) {
  const searchTerm = searchForm.searchField.value
    .split(' ')
    .filter(str => str.length)
    .join('+');

  const apiKey = 'AIzaSyAq6zpPvvGsVxr3rcvzfDuSv1Jj-EBvYtE';
  const queryStr = `q=intitle:${searchTerm}`;
  const apiBaseUrl = 'https://www.googleapis.com/books/v1/volumes';
  const fieldsToReturn = 'fields=kind,totalItems,items(id,volumeInfo(title,authors,publisher,imageLinks(thumbnail),infoLink))';

  fetch(apiBaseUrl + '?' + queryStr + '&' + fieldsToReturn + '&' + apiKey)
    .then(res => res.json())
    .then(bookCollection => {
      if (!bookCollection.totalItems) {
        mainElem.className = `${initialMainElemCls} state__empty-result`;
        window.clearTimeout(timeoutId);
        return;
      }

      renderBookItemContent(bookCollection);
      window.clearTimeout(timeoutId);
    })
    .catch(err => {
      console.log(err.message)
      clientErrHandler();
      window.clearTimeout(timeoutId);
    });
}
class Book {
  static formatAuthors(authors = []) {
    if (!authors.length) return 'No authors found';
    
    switch (authors.length) {
      case 1:
        return authors[0];
      case 2:
        return authors.join(' & ');
      case 3:
        const lastElem = authors.splice(authors.length - 1);
        return `${authors.join(', ')} & ${lastElem[0]}`;
      default:
        const lastTwoElems = authors.splice(authors.length - 2);
        return `${authors.join(', ')} + ${lastTwoElems.join(' & ')}`;
    }
  }

  static validatePublisher(publisher = 'No publisher found') {
    if (!publisher.length) return publisher;
    return publisher;
  }

  static validateImageLinks(imageLinks = {}) {
    if (!imageLinks.hasOwnProperty('thumbnail')) return './img/book-cover-placeholder.png';
    return imageLinks.thumbnail;
  }

  static validateInfoLink(infoLink = 'https://books.google.com/') {
    if (!infoLink.length) return infoLink;
    return infoLink;
  }
}

const bookItemTemplate = document
  .querySelector('.books-item__template')
  .innerHTML;

function generateBookItemContent({ volumeInfo }, htmlTemplate) {
  let template = htmlTemplate;

  template = template.replace('{{thumbnail-url}}', Book.validateImageLinks(volumeInfo.imageLinks));
  template = template.replace('{{thumbnail-alt}}', `${volumeInfo.title} Book Cover`);
  template = template.replace('{{book-title}}', volumeInfo.title);
  template = template.replace('{{book-author}}', Book.formatAuthors(volumeInfo.authors));
  template = template.replace('{{book-publisher}}', Book.validatePublisher(volumeInfo.publisher));
  template = template.replace('{{book-url}}', Book.validateInfoLink(volumeInfo.infoLink));

  return template;
}

function renderBookItemContent(bookCollection) {
  let htmlStr = '';
  for (const book of bookCollection.items) 
    htmlStr += generateBookItemContent(book, bookItemTemplate);

  document.querySelector('.books-list').innerHTML = htmlStr;
  mainElem.className = `${initialMainElemCls} state__books-found`;
}


/* ******** Loading books from API ******** */

function fetchBooks() {
  if (!searchForm.searchField.value) 
    mainElem.className = `${initialMainElemCls} state__query-error`;

  else {
    mainElem.className = `${initialMainElemCls} state__fetching-books`;
    const timeoutId = slowNetworkErrHandler();

    makeBooksRequest(timeoutId);
  }
}

searchForm.btnSearch.addEventListener('click', fetchBooks);

searchForm.searchField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    fetchBooks();
    e.preventDefault();
  }
});
