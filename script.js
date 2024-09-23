let requestCount = 1;

// Função para alternar a exibição do Body baseado no método selecionado
function togglePostBody(selectElement) {
    const postBody = selectElement.closest('.request-container').querySelector('.postBody');
    postBody.style.display = selectElement.value === 'POST' ? 'block' : 'none';
}

// Adicionar campo de header para o Token
function addTokenHeaderField() {
    const container = document.getElementById('tokenHeadersContainer');
    const field = document.createElement('div');
    field.className = 'header-field';
    field.innerHTML = '<input type="text" name="tokenHeaderKey" placeholder="Chave"><input type="text" name="tokenHeaderValue" placeholder="Valor">';
    container.appendChild(field);
}

// Adicionar campo de body para o Token
function addTokenBodyField() {
    const container = document.getElementById('tokenBodyContainer');
    const field = document.createElement('div');
    field.className = 'body-field';
    field.innerHTML = '<input type="text" name="tokenBodyKey" placeholder="Chave"><input type="text" name="tokenBodyValue" placeholder="Valor">';
    container.appendChild(field);
}

// Adicionar campo de header para requisições principais
function addHeaderField(button) {
    const container = button.previousElementSibling;
    const field = document.createElement('div');
    field.className = 'header-field';
    field.innerHTML = '<input type="text" name="headerKey" placeholder="Chave"><input type="text" name="headerValue" placeholder="Valor">';
    container.appendChild(field);
}

// Adicionar campo de body para requisições principais
function addBodyField(button) {
    const container = button.previousElementSibling;
    const field = document.createElement('div');
    field.className = 'body-field';
    field.innerHTML = '<input type="text" name="bodyKey" placeholder="Chave"><input type="text" name="bodyValue" placeholder="Valor">';
    container.appendChild(field);
}

// Adicionar uma nova requisição principal
function addRequest() {
    requestCount++;
    const requestsContainer = document.getElementById('requestsContainer');
    const requestContainer = document.createElement('div');
    requestContainer.className = 'request-container';
    requestContainer.id = `request-${requestCount}`;

    requestContainer.innerHTML = `
        <form class="requestForm">
            <h3>Requisição ${requestCount}</h3>
            <label>Método:</label>
            <select class="method" name="method" onchange="togglePostBody(this)">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
            </select>
            <br><br>
            <label>URL:</label>
            <input type="text" class="url" name="url" required>
            <br><br>
            
            <div class="headersContainer">
                <label>Headers:</label>
                <div class="header-field">
                    <input type="text" name="headerKey" placeholder="Chave">
                    <input type="text" name="headerValue" placeholder="Valor">
                </div>
            </div>
            <button type="button" onclick="addHeaderField(this)">Adicionar Header</button>
            <br><br>
            <label>Status Code Esperado:</label>
            <select class="expectedStatusCode" name="expectedStatusCode">
                <option value="200">200</option>
                <option value="201" selected>201</option>
                <option value="204">204</option>
                <option value="400">400</option>
                <option value="403">403</option>
                <option value="500">500</option>
                <option value="502">502</option>
            </select>
            <br><br>
            <div class="postBody" style="display: none;">
                <label>Body:</label>
                <div class="bodyContainer">
                    <div class="body-field">
                        <input type="text" name="bodyKey" placeholder="Chave">
                        <input type="text" name="bodyValue" placeholder="Valor">
                    </div>
                </div>
                <button type="button" onclick="addBodyField(this)">Adicionar Campo Body</button>
                <br><br>
            </div>
            <button type="button" onclick="removeRequest(this)">Remover Requisição</button>
        </form>
    `;

    requestsContainer.appendChild(requestContainer);
}


// Remover uma requisição principal
function removeRequest(button) {
    const requestContainer = button.closest('.request-container');
    requestContainer.remove();
}

// Gerar o código Python com todas as requisições
function generateCode() {
    const tokenUrl = document.getElementById('tokenUrl').value;
    const tokenHeaders = Array.from(document.querySelectorAll('#tokenHeadersContainer .header-field')).map(field => ({
        key: field.querySelector('input[name="tokenHeaderKey"]').value,
        value: field.querySelector('input[name="tokenHeaderValue"]').value
    }));
    const tokenBody = Array.from(document.querySelectorAll('#tokenBodyContainer .body-field')).map(field => ({
        key: field.querySelector('input[name="tokenBodyKey"]').value,
        value: field.querySelector('input[name="tokenBodyValue"]').value
    }));

    let code = `import requests\n\n`;

    // Função para obter o token
    code += `def obter_token():\n`;
    code += `    token_response = requests.post('${tokenUrl}', headers={\n`;
    tokenHeaders.forEach(header => {
        code += `        '${header.key}': '${header.value}',\n`;
    });
    code += `    }, json={\n`;
    tokenBody.forEach(field => {
        code += `        '${field.key}': '${field.value}',\n`;
    });
    code += `    })\n`;
    code += `    return token_response.json().get('access_token')\n\n`;

    const requestForms = document.querySelectorAll('.requestForm');
    requestForms.forEach((form, index) => {
        const method = form.querySelector('.method').value;
        const url = form.querySelector('.url').value;
        const headers = Array.from(form.querySelectorAll('.headersContainer .header-field')).map(field => ({
            key: field.querySelector('input[name="headerKey"]').value,
            value: field.querySelector('input[name="headerValue"]').value
        }));
        const body = Array.from(form.querySelectorAll('.bodyContainer .body-field')).map(field => ({
            key: field.querySelector('input[name="bodyKey"]').value,
            value: field.querySelector('input[name="bodyValue"]').value
        }));

        // Criar uma função para cada requisição
        code += `def requisicao${index + 1}():\n`;
        code += `    token = obter_token()\n`;
        code += `    response = requests.${method.toLowerCase()}('${url}', headers={\n`;
        headers.forEach(header => {
            code += `        '${header.key}': '${header.value}',\n`;
        });
        code += `        'Authorization': f'Bearer {token}'\n`;
        code += `    }`;
        if (method === 'POST') {
            code += `, json={\n`;
            body.forEach(field => {
                code += `        '${field.key}': '${field.value}',\n`;
            });
            code += `    }`;
        }
        code += `)\n`;
        code += `    print(response.json())\n\n`;
    });

    document.getElementById('generatedCode').value = code;
}


// Copiar o código gerado para a área de transferência
function copyCode() {
    const code = document.getElementById('generatedCode');
    code.select();
    document.execCommand('copy');
    alert('Código copiado para a área de transferência!');
}

// Limpar os campos do Token
function clearTokenFields() {
    document.getElementById('tokenUrl').value = '';
    document.querySelectorAll('#tokenHeadersContainer .header-field').forEach(field => field.remove());
    document.querySelectorAll('#tokenBodyContainer .body-field').forEach(field => field.remove());
}
