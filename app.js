const express = require('express');
const fs = require('fs');
const simpleGit = require('simple-git');
const git = simpleGit();
const app = express();
app.use(express.json());

async function commitChanges(message) {
    await git.add('./output.html'); // Ajusta esta ruta si es necesario
    await git.commit(message);
    await git.push('origin', 'main'); // Ajusta el nombre del branch
}

app.post('/api/update-content', async (req, res) => {
    const { content } = req.body;

    fs.writeFile('output.html', content, async (err) => {
        if (err) {
            return res.status(500).send('Error al guardar el contenido');
        }

        await commitChanges('Actualización automática desde la aplicación');
        res.send('Contenido actualizado y enviado a GitHub correctamente');
    });
});

app.get('/output', (req, res) => {
    fs.readFile('output.html', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el contenido');
        }

        res.header('Content-Type', 'text/html');
        res.send(data);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
