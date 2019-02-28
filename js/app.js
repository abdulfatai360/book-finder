
const mainElem = document.querySelector('.main');
const initialMainElemCls = `main container`;
const searchForm = document.querySelector('.search-form');
const bookItemTemplate = document.querySelector('.books-item__template');

const response = {
  kind: "books#volumes",
  totalItems: 429,
  items: [
    {
      id: "szF_pLGmJTQC",
      volumeInfo: {
        title: "Baptizing Harry Potter",
        authors: [
          "Luke Bell"
        ],
        publisher: "Paulist Press",
        imageLinks: {
          thumbnail: "http://books.google.com/books/content?id=szF_pLGmJTQC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
        },
        infoLink: "http://books.google.com/books?id=szF_pLGmJTQC&dq=intitle:harry+potter&hl=&source=gbs_api"
      }
    },
    {
      id: "DKcWE3WXoj8C",
      volumeInfo: {
        title: "Harry Potter and International Relations",
        // authors: [
        //   "Daniel H. Nexon",
        //   "Iver B. Neumann"
        // ],
        // publisher: "Rowman & Littlefield",
        // imageLinks: {
        //   thumbnail: "http://books.google.com/books/content?id=DKcWE3WXoj8C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
        // },
        infoLink: "http://books.google.com/books?id=DKcWE3WXoj8C&dq=intitle:harry+potter&hl=&source=gbs_api"
      }
    },
    {
      id: "pBjDSPhUjp8C",
      volumeInfo: {
        title: "The Ultimate Harry Potter and Philosophy",
        authors: [
          "William Irwin",
          "Gregory Bassham",
          "Iver B. Neumann"
        ],
        publisher: "John Wiley & Sons",
        imageLinks: {
          thumbnail: "http://books.google.com/books/content?id=pBjDSPhUjp8C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
        },
        infoLink: "http://books.google.com/books?id=pBjDSPhUjp8C&dq=intitle:harry+potter&hl=&source=gbs_api"
      }
    },
  ]
};

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

function generateBookItemContent({ volumeInfo }) {
  let template = bookItemTemplate.innerHTML;

  template = template.replace('{{thumbnail-url}}', Book.validateImageLinks(volumeInfo.imageLinks));
  template = template.replace('{{thumbnail-alt}}', `${volumeInfo.title} Book Cover`);
  template = template.replace('{{book-title}}', volumeInfo.title);
  template = template.replace('{{book-author}}', Book.formatAuthors(volumeInfo.authors));
  template = template.replace('{{book-publisher}}', Book.validatePublisher(volumeInfo.publisher));
  template = template.replace('{{book-url}}', Book.validateInfoLink(volumeInfo.infoLink));

  return template;
}

function renderBookItemContent() {
  let htmlStr = '';
  for (const book of response.items) htmlStr += generateBookItemContent(book);

  document.querySelector('.books-list').innerHTML = htmlStr;
  mainElem.className = `${initialMainElemCls} state__books-found`;
}

function fetchBooks() {
  if (!searchForm.searchField.value) 
    mainElem.className = `${initialMainElemCls} state__query-error`;

  else {
    mainElem.className = `${initialMainElemCls} state__fetching-books`;

    setTimeout(() => {
      if (!response.items.length) {
        mainElem.className = `${initialMainElemCls} state__empty-result`;
        return;
      }
      renderBookItemContent();
    }, 2000);
  }
}

searchForm.btnSearch.addEventListener('click', fetchBooks);

searchForm.searchField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    fetchBooks();
    e.preventDefault();
  }
});
