const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8000;
const productsFilePath = path.join(__dirname, 'data', 'products.json');

app.use(express.json());

// Helper function to read products
const getProducts = () => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

// Helper function to write products
const saveProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
};

// GET all products
app.get('/api/v1/products', (req, res) => {
    try {
        const products = getProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error reading products' });
    }
});

// POST new product
app.post('/api/v1/products', (req, res) => {
    try {
        const products = getProducts();
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            ...req.body
        };
        products.push(newProduct);
        saveProducts(products);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error saving product' });
    }
});

// PATCH update product
app.patch('/api/v1/products/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const products = getProducts();
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updatedProduct = { ...products[productIndex], ...req.body };
        products[productIndex] = updatedProduct;
        saveProducts(products);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// DELETE product
app.delete('/api/v1/products/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const products = getProducts();
        const updatedProducts = products.filter(p => p.id !== id);

        if (products.length === updatedProducts.length) {
            return res.status(404).json({ message: 'Product not found' });
        }

        saveProducts(updatedProducts);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
