enum Genre {
    Fiction = "Fiction",
    NonFiction = "Non-Fiction",
    Science = "Science",
    History = "History"
}

type AvailabilityStatus = 'Available' | 'Not Available';

interface Book {
    id: number;
    title: string;
    author: string;
    genre: Genre;
    publishedYear: number;
    isAvailable: boolean;
    imageUrl?: string; // Optional for the image URL or uploaded image
}

class Library {
    public books: Book[] = [];
    private isUpdating: boolean = false; 
    private bookToUpdateId: number | null = null; 

    constructor() {}

    // Generic function to get HTML elements with type safety
    private getElement<T extends HTMLElement>(id: string): T | null {
        return document.getElementById(id) as T | null;
    }

    handleAddBookFormSubmit(event: Event): void {
        event.preventDefault(); 

        const id = this.getElement<HTMLInputElement>('book-id')!.value;
        const title = this.getElement<HTMLInputElement>('book-title')!.value;
        const author = this.getElement<HTMLInputElement>('book-author')!.value;
        const genre = this.getElement<HTMLSelectElement>('book-genre')!.value as Genre;
        const year = this.getElement<HTMLInputElement>('book-year')!.value;
        const isAvailable = this.getElement<HTMLInputElement>('book-availability')!.checked;

        let imageUrl: string | undefined;
        const imageUrlInput = this.getElement<HTMLInputElement>('book-image-link')!.value;
        const imageFile = this.getElement<HTMLInputElement>('book-image-upload')!.files?.[0];

        if (imageUrlInput) {
            imageUrl = imageUrlInput;
        } else if (imageFile) {
            imageUrl = URL.createObjectURL(imageFile);
        }

        // Validate input fields
        if (!title || !author || isNaN(Number(year)) || !genre || isNaN(Number(id))) {
            alert("Please fill in all fields correctly.");
            return;
        }

        const newBook: Book = {
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
        } else {
            this.addBook(newBook);
        }

        this.displayBooksInManage(); // Show results in the table
        this.resetForm(); // Reset form fields
        this.closeAddBookPopup(); // Close the popup
    }

    addBook(book: Book): void {
        if (this.books.some(b => b.id === book.id)) {
            alert("A book with this ID already exists.");
            return;
        }
        this.books.push(book);
        console.log("Added Book: ", book); // Log for debugging
    }

    updateBook(updatedBook: Book): void {
        const index = this.books.findIndex(book => book.id === this.bookToUpdateId);
        if (index !== -1) {
            this.books[index] = updatedBook;
            console.log("Updated Book: ", updatedBook); // Log for debugging
        }
        this.displayBooksInManage();
        this.isUpdating = false; // Reset updating status after updating
        this.bookToUpdateId = null; // Reset bookToUpdateId after updating
    }

    updateBookForm(id: number): void {
        const bookToUpdate = this.books.find(book => book.id === id);
        if (bookToUpdate) {
            this.getElement<HTMLInputElement>('book-id')!.value = bookToUpdate.id.toString();
            this.getElement<HTMLInputElement>('book-title')!.value = bookToUpdate.title;
            this.getElement<HTMLInputElement>('book-author')!.value = bookToUpdate.author;
            this.getElement<HTMLSelectElement>('book-genre')!.value = bookToUpdate.genre;
            this.getElement<HTMLInputElement>('book-year')!.value = bookToUpdate.publishedYear.toString();
            this.getElement<HTMLInputElement>('book-availability')!.checked = bookToUpdate.isAvailable;

            this.isUpdating = true;
            this.bookToUpdateId = bookToUpdate.id;
            this.getElement<HTMLButtonElement>('submit-book-btn')!.textContent = "Update Book";

            const popup = this.getElement<HTMLElement>("addBookModal");
            if (popup) {
                const modal = new bootstrap.Modal(popup);
                modal.show();
            }
        } else {
            alert("Book not found.");
        }
    }

    resetForm(): void {
        this.getElement<HTMLInputElement>('book-id')!.value = '';
        this.getElement<HTMLInputElement>('book-title')!.value = '';
        this.getElement<HTMLInputElement>('book-author')!.value = '';
        this.getElement<HTMLSelectElement>('book-genre')!.value = '';
        this.getElement<HTMLInputElement>('book-year')!.value = '';
        this.getElement<HTMLInputElement>('book-availability')!.checked = false;
        this.getElement<HTMLInputElement>('book-image-link')!.value = '';
        this.getElement<HTMLInputElement>('book-image-upload')!.value = '';
        this.getElement<HTMLButtonElement>('submit-book-btn')!.textContent = "Add Book";

        this.isUpdating = false;
        this.bookToUpdateId = null;
    }

    closeAddBookPopup(): void {
        const popup = this.getElement<HTMLElement>("addBookModal");
        if (popup) {
            const modal = bootstrap.Modal.getInstance(popup);
            if (modal) {
                modal.hide();
            }
        }
    }

    displayBooksInManage(): void {
        const manageTableBody = this.getElement<HTMLElement>('book-list');
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

    downloadBook(bookId: number): void {
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
        } else {
            alert("Book not found.");
        }
    }    
    
    deleteBook(id: number): void {
        this.books = this.books.filter(book => book.id !== id);
        this.displayBooksInManage();
        console.log(`Deleted Book ID: ${id}`); // Log for debugging
    }

    displayBooksInAll(): void {
        const allBooksContainer = this.getElement<HTMLElement>('all-books-container');
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

    searchBooks(searchTerm: string, selectedGenre: Genre | ''): void {
        const manageTableBody = this.getElement<HTMLElement>('book-list');
        if (manageTableBody) {
            manageTableBody.innerHTML = ''; // Clear previous data
    
            const filteredBooks = this.books.filter(book => {
                const matchesSearchTerm =
                    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

window.onload = function() {
    // Existing event listeners...

    // Search and filter functionality
    document.getElementById('search-input')?.addEventListener('input', (event) => {
        const searchTerm = (event.target as HTMLInputElement).value;
        const selectedGenre = (document.getElementById('genre-filter') as HTMLSelectElement).value as Genre;
        const selectedAvailability = (document.getElementById('availability-filter') as HTMLInputElement).checked;
        myLibrary.searchBooks(searchTerm, selectedGenre);
    });

    document.getElementById('genre-filter')?.addEventListener('change', (event) => {
        const searchTerm = (document.getElementById('search-input') as HTMLInputElement).value;
        const selectedGenre = (document.getElementById('genre-filter') as HTMLSelectElement).value as Genre;
        const selectedAvailability = (document.getElementById('availability-filter') as HTMLInputElement).checked;
        myLibrary.searchBooks(searchTerm, selectedGenre);
    });
    
    document.getElementById('availability-filter')?.addEventListener('change', (event) => {
        const searchTerm = (document.getElementById('search-input') as HTMLInputElement).value;
        const selectedGenre = (document.getElementById('genre-filter') as HTMLSelectElement).value as Genre;
        const selectedAvailability = (event.target as HTMLInputElement).checked;
        myLibrary.searchBooks(searchTerm, selectedGenre);
    });
    // Event listeners for search and genre selection
    document.getElementById('search-btn')?.addEventListener('click', () => {
        const searchTerm = (document.getElementById('search-input') as HTMLInputElement).value;
        const selectedGenre = (document.getElementById('genre-filter') as HTMLSelectElement).value as Genre;
        myLibrary.searchBooks(searchTerm, selectedGenre);
    });

    // Display all books on page load
    document.addEventListener("DOMContentLoaded", () => {
        myLibrary.displayBooksInAll(); // Display books in card layout
    });
};

// Form submission event
document.getElementById('add-book-form')?.addEventListener('submit', (event) => {
    myLibrary.handleAddBookFormSubmit(event);
});
