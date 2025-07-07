document.addEventListener('DOMContentLoaded', () => {
    const articlesList = document.getElementById('articles-list');
    const NEWS_API_KEY = 'pub_f3dda2c85dbd40198514f5f3e531ea09'; // Sua chave da API

    /**
     * Função para buscar artigos de saúde da API NewsData.io e exibi-los na página.
     */
    const fetchArticles = async () => {
        // Verifica se a chave da API está configurada
        if (!NEWS_API_KEY || NEWS_API_KEY === 'SUA_CHAVE_API_VAI_AQUI') {
            articlesList.innerHTML = `<p class="info-text">Erro: A chave da API (NEWS_API_KEY) não foi configurada.</p>`;
            return;
        }

        // MODIFICAÇÃO: Adicionado o parâmetro "&size=10" para buscar mais artigos.
        const apiUrl = `https://newsdata.io/api/1/latest?apikey=${NEWS_API_KEY}&q=health&language=pt&size=10`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 401) throw new Error('Chave da API inválida ou expirada.');
                throw new Error(`Erro na API: ${response.statusText}`);
            }

            const data = await response.json();
            const articles = data.results;
               console.log(articles)

            if (articles && articles.length > 0) {
                articlesList.innerHTML = ''; // Limpa a mensagem de "carregando"

                articles.forEach(article => {
                    const articleCard = document.createElement('a');
                    articleCard.href = article.link;
                    articleCard.target = '_blank'; // Abre o link em uma nova aba
                    articleCard.rel = 'noopener noreferrer';
                    articleCard.classList.add('article-card');

                    const imageUrl = article.image_url || `https://via.placeholder.com/400x200/4E4E4E/FFFFFF?text=Sem+Imagem`;
                    const sourceName = article.source_id || 'Fonte desconhecida';
                    const title = article.title;

                    articleCard.innerHTML = `
                        <img src="${imageUrl}" alt="${title}">
                        <div class="article-content">
                            <h3>${title}</h3>
                            <p class="article-source">${sourceName}</p>
                        </div>
                    `;
                    articlesList.appendChild(articleCard);
                });
            } else {
                articlesList.innerHTML = `<p class="info-text">Nenhum artigo de saúde encontrado no momento.</p>`;
            }
        } catch (error) {
            console.error("Erro ao buscar artigos:", error);
            articlesList.innerHTML = `<p class="info-text">Não foi possível carregar as notícias. ${error.message}</p>`;
        }
    };

    // Chama a função para buscar os artigos assim que a página carregar
    fetchArticles();
});