const { json } = require("express");

const request = indexedDB.open("BudgetTracker", 1)

let db;

request.onupgradeneeded = ({ target}) => {
    const db = target.result;
    db.createObjectStore("budgetpending", {autoIncrement : true})
};

request.onsuccess = ({target}) => {
    db = target.results;
    if(navigator.online){
        upload();
    }
};

request.error = ({target}) => {
    console.log(target.error)
}

function save(data) {
    const transaction = db.transaction(["budgetTracker"], "readWrite")
    const transactionStore = transaction.objectStore("budgetTracker")
    transactionStore.add(data)
}

function upload() {
    const transaction = db.transaction(["budgetTracker"], "readWrite");
    const transactionStore = transaction.objectStore("budgetTracker");
    const getAll = transactionStore.getAll();

    getAll.onsuccess = () => {
        if(getAll.result.length > 0){
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                 Aceept: "application/json, text/plain, */*",
                 "Content-Type": "application/json",
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["budgetpending"], "readwrite")
                const transactionStore = transaction.objectStore("budgetpending")
                transactionStore.clear()
            })
        }
        

    };
}

function deletePending() {
    const transaction = db.transaction(["budgetpending"], "readwrite")
    const transactionStore = transaction.objectStore("budgetpending")
    transactionStore.clear()
}


window.addEventListener("online", upload)