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

// Função para gerar o código Python
function generatePythonCode() {
    const tokenUrl = document.getElementById('tokenUrl').value;
    const tokenHeaders = Array.from(document.querySelectorAll('#tokenHeadersContainer .header-field')).map(field => ({
        key: field.querySelector('input[name="tokenHeaderKey"]').value,
        value: field.querySelector('input[name="tokenHeaderValue"]').value
    }));
    const tokenBody = Array.from(document.querySelectorAll('#tokenBodyContainer .body-field')).map(field => ({
        key: field.querySelector('input[name="tokenBodyKey"]').value,
        value: field.querySelector('input[name="tokenBodyValue"]').value
    }));

    // Resetar código gerado
    let pythonCode = `import requests\n\n`;
    
    // Função para obter o token em Python
    pythonCode += `def obter_token():\n`;
    pythonCode += `    token_response = requests.post('${tokenUrl}', headers={\n`;
    tokenHeaders.forEach(header => {
        pythonCode += `        '${header.key}': '${header.value}',\n`;
    });
    pythonCode += `    }, json={\n`;
    tokenBody.forEach(field => {
        pythonCode += `        '${field.key}': '${field.value}',\n`;
    });
    pythonCode += `    })\n`;
    pythonCode += `    return token_response.json().get('access_token')\n\n`;

    // Iniciar funções de requisição
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

        // Função Python para a requisição
        pythonCode += `def requisicao${index + 1}():\n`;
        pythonCode += `    token = obter_token()\n`;
        pythonCode += `    response = requests.${method.toLowerCase()}('${url}', headers={\n`;
        headers.forEach(header => {
            pythonCode += `        '${header.key}': '${header.value}',\n`;
        });
        pythonCode += `        'Authorization': f'Bearer {token}'\n`;
        pythonCode += `    }`;
        if (method === 'POST') {
            pythonCode += `, json={\n`;
            body.forEach(field => {
                pythonCode += `        '${field.key}': '${field.value}',\n`;
            });
            pythonCode += `    }`;
        }
        pythonCode += `)\n`;
        pythonCode += `    return response\n\n`;
    });

    // Atualizar área de texto com o código gerado
    document.getElementById('generatedCode').value = pythonCode;
}

// Função para gerar o código Robot
function generateRobotCode() {
    let robotCode = "*** Settings ***\nLibrary    RequestsLibrary\n\n*** Test Cases ***\nValidar Status Code das Requisições\n";

    // Iterar sobre todas as requisições e adicionar ao bloco de Test Cases
    const requestForms = document.querySelectorAll('.requestForm');
    requestForms.forEach((form, index) => {
        robotCode += `    Chamar Requisicao ${index + 1}\n`;
    });

    // Iniciar Keywords section no Robot Framework
    robotCode += "\n*** Keywords ***\n";

    // Iterar sobre todas as requisições e adicionar ao bloco de Keywords
    requestForms.forEach((form, index) => {
        const expectedStatusCode = form.querySelector('.expectedStatusCode').value;

        // Adicionar a keyword ao bloco de Keywords
        robotCode += `Chamar Requisicao ${index + 1}\n`;
        robotCode += `    \${response_${index + 1}} =    requisicao${index + 1}\n`;
        robotCode += `    Should Be Equal As Numbers    \${response_${index + 1}.status_code}    ${expectedStatusCode}\n\n`;
    });

    // Atualizar área de texto com o código gerado
    document.getElementById('generatedRobotCode').value = robotCode;
}

// Função para gerar ambos os códigos
function generateCode() {
    generatePythonCode();
    generateRobotCode();
}

// Adicionar listener para o botão de geração
document.getElementById('generateButton').addEventListener('click', generateCode);

// Função para copiar o código Python para a área de transferência
function copyPythonCode() {
    const code = document.getElementById('generatedCode');
    code.select();
    document.execCommand('copy');
    alert('Código Python copiado para a área de transferência!');
}

// Função para copiar o código Robot para a área de transferência
function copyRobotCode() {
    const code = document.getElementById('generatedRobotCode');
    code.select();
    document.execCommand('copy');
    alert('Código Robot copiado para a área de transferência!');
}