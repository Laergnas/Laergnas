// scripts.js
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-storage.js";

let creationMode = false;

function toggleCreationMode() {
    const pin = prompt("Introduce el PIN para acceder al modo de creación:");
    if (pin === "2498") {
        creationMode = !creationMode;
        const creationTools = document.getElementById("creation-tools");
        creationTools.style.display = creationMode ? "block" : "none";
    } else {
        alert("PIN incorrecto");
    }
}

async function addArticle() {
    const name = document.getElementById("article-name").value;
    const price = document.getElementById("article-price").value;
    const category = document.getElementById("article-category").value;
    const preorder = document.getElementById("preorder").checked;
    const file = document.getElementById("article-file").files[0];
    const link = document.getElementById("preorder-link").value;

    if (file) {
        // Subir el archivo a Firebase Storage
        const storage = window.firebaseStorage;
        const storageRef = ref(storage, 'uploads/' + file.name);
        
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(snapshot.ref);
            saveArticle({ name, price, category, preorder, link, fileUrl, fileType: file.type });
        } catch (error) {
            console.error("Error al subir el archivo a Firebase Storage:", error);
        }
    } else {
        saveArticle({ name, price, category, preorder, link, fileUrl: null, fileType: null });
    }
}

function saveArticle(article) {
    let articles = JSON.parse(localStorage.getItem("articles")) || [];
    articles.push(article);
    localStorage.setItem("articles", JSON.stringify(articles));
    displayArticle(article);

    document.getElementById("creation-form").reset();
    creationMode = false;
    const creationTools = document.getElementById("creation-tools");
    creationTools.style.display = "none";
}

function displayArticle(article) {
    const articleDiv = document.createElement("div");
    articleDiv.className = "article";

    let articleContent = `
        <h3>${article.name}</h3>
        <p>Precio: ${article.price}</p>
        <p>Categoría: ${article.category}</p>
    `;

    if (article.fileUrl) {
        if (article.fileType.startsWith("image/")) {
            articleContent += `<img src="${article.fileUrl}" alt="${article.name}" style="max-width: 100%;">`;
        } else if (article.fileType.startsWith("video/")) {
            articleContent += `<video src="${article.fileUrl}" controls style="max-width: 100%;"></video>`;
        } else {
            articleContent += `<a href="${article.fileUrl}" download>Descargar archivo</a>`;
        }
    }

    if (article.preorder && article.link) {
        articleContent += `<a href="${article.link}" class="preorder-link" target="_blank">Ir a preorder</a>`;
    }

    articleContent += `<button class="delete-button" onclick="deleteArticle(this)">Eliminar</button>`;

    articleDiv.innerHTML = articleContent;

    document.getElementById("articles").appendChild(articleDiv);
}

function deleteArticle(button) {
    const pin = prompt("Introduce el PIN para eliminar el artículo:");
    if (pin === "2498") {
        const articleDiv = button.parentElement;
        articleDiv.remove();
    } else {
        alert("PIN incorrecto");
    }
}