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

// Endpoint para recibir el webhook de GitHub
app.post('/github-webhook', (req, res) => {
    const payload = req.body;

    // Verifica si el evento es un push a la rama principal
    if (payload.ref === 'refs/heads/main') {
        // Ejecuta git pull
        const simpleGit = require('simple-git');
        const git = simpleGit();

        git.pull('origin', 'main', (err, update) => {
            if (err) {
                return res.status(500).send('Error al hacer pull');
            }

            // Verifica si el pull trajo cambios
            if (update && update.summary.changes) {
                console.log('Se actualizaron los archivos');
                res.status(200).send('Repositorio actualizado');
            } else {
                console.log('No hay cambios');
                res.status(200).send('No hay cambios en el repositorio');
            }
        });
    } else {
        res.status(200).send('Evento ignorado');
    }
});
