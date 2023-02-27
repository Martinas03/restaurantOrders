const express = require('express')
const fs = require('fs');
const path = require('path');

const app = express()
app.use(express.json())
const port = 4000;

app.get('/', (req, res) => {
    res.sendFile(path.resolve('static/index.html'));
})

app.get('/orders', (req, res) => {
    res.sendFile(path.resolve('static/orders.html'));
})

app.get('/admin', (req, res) => {
    res.sendFile(path.resolve('static/admin.html'));
})

app.get('/api/orders', (req, res) => {
    ordersDB.get(res);
})

app.delete('/api/orders/:id', (req, res) => {
    ordersDB.delete(parseInt(req.params.id), res);
})

app.post('/api/orders', (req, res) => {
    const newTodo = {id: Date.now(), title: req.body.title, isDone: false};
    fs.readFile('db/orders.json', 'utf8', (err, data) => {
        if (err) {
            console.log('read', err);
            return;
        }
        const file = JSON.parse(data);

        file.orders = [...file.orders, newTodo];
        fs.writeFile('db/orders.json', JSON.stringify(file), 'utf8', (err) => {
            console.log('write', err);
        })
        res.send(newTodo);
    })
})

app.put('/api/orders/:id', (req, res) => {
    fs.readFile('db/orders.json', 'utf8', (err, data) => {
        if (err) {
            console.log('read', err);
            return;
        }
        const file = JSON.parse(data);
        let updatedOrder = null;
        file.orders = file.orders.map((order) => {
            if (order.id === parseInt(req.params.id)) {
                updatedOrder = {...order, isDone: req.body.isDone};
                return updatedOrder;
            }
            return order;
        })
        fs.writeFile('db/orders.json', JSON.stringify(file), 'utf8', (err) => {
            console.log('write', err);
        })
        if (updatedOrder) {
            res.send(updatedOrder);
        } else {
            res.sendStatus(404);
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})

const ordersDB = {
    get: (res) => ordersFs((orders) => orders, res),
    delete: (id, res) => ordersFs((orders) => orders.filter((o) => o.id !== id), res),
}

const ordersFs = (func, res) => {
    fs.readFile('db/orders.json', 'utf8', (err, data) => {
        if (err) {
            console.log('read', err);
            return;
        }
        const file = JSON.parse(data);

        file.orders = func(file.orders);
        fs.writeFile('db/orders.json', JSON.stringify(file), 'utf8', (err) => {
            console.log('write', err);
        })
        res.send(file);
    })
}