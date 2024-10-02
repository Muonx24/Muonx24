"use strict";
var _a;
var Genre;
(function (Genre) {
    Genre["Fiction"] = "Fiction";
    Genre["NonFiction"] = "Non-Fiction";
    Genre["Science"] = "Science";
    Genre["History"] = "History";
})(Genre || (Genre = {}));
class Library {
    constructor() {
        this.books = [];
        this.isUpdating = false;
        this.bookToUpdateId = null;
    }
    // Generic function to get HTML elements with type safety
    getElement(id) {
        return document.getElementById(id);
    }
    handleAddBookFormSubmit(event) {
        var _a;
        event.preventDefault();
        const id = this.getElement('book-id').value;
        const title = this.getElement('book-title').value;
        const author = this.getElement('book-author').value;
        const genre = this.getElement('book-genre').value;
        const year = this.getElement('book-year').value;
        const isAvailable = this.getElement('book-availability').checked;
        let imageUrl;
        const imageUrlInput = this.getElement('book-image-link').value;
        const imageFile = (_a = this.getElement('book-image-upload').files) === null || _a === void 0 ? void 0 : _a[0];
        if (imageUrlInput) {
            imageUrl = imageUrlInput;
        }
        else if (imageFile) {
            imageUrl = URL.createObjectURL(imageFile);
        }
        // Validate input fields
        if (!title || !author || isNaN(Number(year)) || !genre || isNaN(Number(id))) {
            alert("Please fill in all fields correctly.");
            return;
        }
        const newBook = {
            id: Number(id),
            title,
            author,
            genre,
            publishedYear: Number(year),
            isAvailable,
            imageUrl
        };
        // Update or Add Book
        if (this.isUpdating && this.bookToUpdateId !== null) {
            this.updateBook(newBook);
        }
        else {
            this.addBook(newBook);
        }
        this.displayBooksInManage(); // Show results in the table
        this.resetForm(); // Reset form fields
        this.closeAddBookPopup(); // Close the popup
    }
    addBook(book) {
        if (this.books.some(b => b.id === book.id)) {
            alert("A book with this ID already exists.");
            return;
        }
        this.books.push(book);
        console.log("Added Book: ", book); // Log for debugging
    }
    updateBook(updatedBook) {
        const index = this.books.findIndex(book => book.id === this.bookToUpdateId);
        if (index !== -1) {
            this.books[index] = updatedBook;
            console.log("Updated Book: ", updatedBook); // Log for debugging
        }
        this.displayBooksInManage();
        this.isUpdating = false; // Reset updating status after updating
        this.bookToUpdateId = null; // Reset bookToUpdateId after updating
    }
    updateBookForm(id) {
        const bookToUpdate = this.books.find(book => book.id === id);
        if (bookToUpdate) {
            this.getElement('book-id').value = bookToUpdate.id.toString();
            this.getElement('book-title').value = bookToUpdate.title;
            this.getElement('book-author').value = bookToUpdate.author;
            this.getElement('book-genre').value = bookToUpdate.genre;
            this.getElement('book-year').value = bookToUpdate.publishedYear.toString();
            this.getElement('book-availability').checked = bookToUpdate.isAvailable;
            this.isUpdating = true;
            this.bookToUpdateId = bookToUpdate.id;
            this.getElement('submit-book-btn').textContent = "Update Book";
            const popup = this.getElement("addBookModal");
            if (popup) {
                const modal = new bootstrap.Modal(popup);
                modal.show();
            }
        }
        else {
            alert("Book not found.");
        }
    }
    resetForm() {
        this.getElement('book-id').value = '';
        this.getElement('book-title').value = '';
        this.getElement('book-author').value = '';
        this.getElement('book-genre').value = '';
        this.getElement('book-year').value = '';
        this.getElement('book-availability').checked = false;
        this.getElement('book-image-link').value = '';
        this.getElement('book-image-upload').value = '';
        this.getElement('submit-book-btn').textContent = "Add Book";
        this.isUpdating = false;
        this.bookToUpdateId = null;
    }
    closeAddBookPopup() {
        const popup = this.getElement("addBookModal");
        if (popup) {
            const modal = bootstrap.Modal.getInstance(popup);
            if (modal) {
                modal.hide();
            }
        }
    }
    displayBooksInManage() {
        const manageTableBody = this.getElement('book-list');
        if (!manageTableBody) {
            console.error("Manage table body element not found.");
            return; // Exit the function if manageTableBody is not found
        }
        manageTableBody.innerHTML = ''; // Clear previous data
        this.books.forEach((book) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${book.imageUrl || 'placeholder.jpg'}" alt="${book.title}" style="width: 50px; height: 75px;"></td>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.publishedYear}</td>
                <td>${book.genre}</td>
                <td>${book.isAvailable ? 'Available' : 'Not Available'}</td>
                <td>
                    <button class="btn btn-warning button-space" onclick="myLibrary.updateBookForm(${book.id})">Update</button>
                    <button class="btn btn-danger" onclick="myLibrary.deleteBook(${book.id})">Delete</button>
                </td>
                <td>
                    <button class="btn btn-info" onclick="myLibrary.downloadBook(${book.id})">Download</button>
                </td>
            `;
            manageTableBody.appendChild(row);
        });
    }
    downloadBook(bookId) {
        console.log(`Attempting to download book with ID: ${bookId}`); // Log to see if the function is called
        const book = this.books.find(b => b.id === bookId);
        if (book) {
            const blob = new Blob([JSON.stringify(book, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`; // Create a valid filename
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Free up memory
        }
        else {
            alert("Book not found.");
        }
    }
    deleteBook(id) {
        this.books = this.books.filter(book => book.id !== id);
        this.displayBooksInManage();
        console.log(`Deleted Book ID: ${id}`); // Log for debugging
    }
    displayBooksInAll() {
        const allBooksContainer = this.getElement('all-books-container');
        if (allBooksContainer) {
            allBooksContainer.innerHTML = ''; // Clear previous data
            const cardGroup = document.createElement('div');
            cardGroup.classList.add('card-group');
            this.books.forEach((book) => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
                    <img class="card-img-top" src="${book.imageUrl || 'placeholder.jpg'}" alt="${book.title}">
                    <div class="card-body">
                        <h5 class="card-title">${book.title}</h5>
                        <p class="card-text">Author: ${book.author}</p>
                        <p class="card-text">Published Year: ${book.publishedYear}</p>
                        <p class="card-text">Genre: ${book.genre}</p>
                        <p class="card-text">${book.isAvailable ? 'Available' : 'Not Available'}</p>
                    </div>
                `;
                cardGroup.appendChild(card);
            });
            allBooksContainer.appendChild(cardGroup);
        }
    }
    searchBooks(searchTerm, selectedGenre) {
        const manageTableBody = this.getElement('book-list');
        if (manageTableBody) {
            manageTableBody.innerHTML = ''; // Clear previous data
            const filteredBooks = this.books.filter(book => {
                const matchesSearchTerm = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.publishedYear.toString().includes(searchTerm) ||
                    book.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.id.toString().includes(searchTerm);
                const matchesGenre = selectedGenre ? book.genre === selectedGenre : true;
                return matchesSearchTerm && matchesGenre;
            });
            filteredBooks.forEach((book) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${book.imageUrl || 'placeholder.jpg'}" alt="${book.title}" style="width: 50px; height: 75px;"></td>
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.publishedYear}</td>
                    <td>${book.genre}</td>
                    <td>${book.isAvailable ? 'Available' : 'Not Available'}</td>
                    <td>
                        <button class="btn btn-warning" style="margin-bottom: 5px;" onclick="myLibrary.updateBookForm(${book.id})">Update</button>
                        <button class="btn btn-danger" onclick="myLibrary.deleteBook(${book.id})">Delete</button>
                    </td>
                    <td>
                        <button class="btn btn-info" onclick="myLibrary.downloadBook(${book.id})">Download</button>
                    </td>
                `;
                manageTableBody.appendChild(row);
            });
        }
    }
}
const myLibrary = new Library();
window.onload = function () {
    // Existing event listeners...
    var _a, _b, _c, _d;
    // Search and filter functionality
    (_a = document.getElementById('search-input')) === null || _a === void 0 ? void 0 : _a.addEventListener('input', (event) => {
        const searchTerm = event.target.value;
        const selectedGenre = document.getElementById('genre-filter').value;
        const selectedAvailability = document.getElementById('availability-filter').checked;
        myLibrary.searchBooks(searchTerm, selectedGenre);
    });
    (_b = document.getElementById('genre-filter')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', (event) => {
        const searchTerm = document.getElementById('search-input').value;
        const selectedGenre = document.getElementById('genre-filter').value;
        const selectedAvailability = document.getElementById('availability-filter').checked;
        myLibrary.searchBooks(searchTerm, selectedGenre);
    });
    (_c = document.getElementById('availability-filter')) === null || _c === void 0 ? void 0 : _c.addEventListener('change', (event) => {
        const searchTerm = document.getElementById('search-input').value;
        const selectedGenre = document.getElementById('genre-filter').value;
        const selectedAvailability = event.target.checked;
        myLibrary.searchBooks(searchTerm, selectedGenre);
    });
    // Event listeners for search and genre selection
    (_d = document.getElementById('search-btn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
        const searchTerm = document.getElementById('search-input').value;
        const selectedGenre = document.getElementById('genre-filter').value;
        myLibrary.searchBooks(searchTerm, selectedGenre);
    });
    // Display all books on page load
    document.addEventListener("DOMContentLoaded", () => {
        myLibrary.displayBooksInAll(); // Display books in card layout
    });
};
// Form submission event
(_a = document.getElementById('add-book-form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (event) => {
    myLibrary.handleAddBookFormSubmit(event);
});
