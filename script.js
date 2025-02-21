document.addEventListener('DOMContentLoaded', () => {
  const outputArea = document.getElementById('output-area');
  const inputText = document.getElementById('input-text');
  const sendButton = document.getElementById('send-button');

  if (typeof chrome === 'undefined') {
      chrome = {};
  }

  sendButton.addEventListener('click', processInput);
  inputText.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          processInput();
      }
  });

  async function processInput() {
      const text = inputText.value.trim();
      if (!text) {
          showError('Please enter some text.');
          return;
      }

      try {
          const messageElement = createMessageElement(text);
          outputArea.appendChild(messageElement);
          inputText.value = '';

          const detectedLanguage = await detectLanguage(text);
          const languageElement = document.createElement('p');
          languageElement.textContent = `Detected Language: ${detectedLanguage}`;
          messageElement.appendChild(languageElement);

          if (text.length > 150 && detectedLanguage === 'en') {
              const summarizeButton = createButton('Summarize', () => summarizeText(text, messageElement));
              messageElement.appendChild(summarizeButton);
          }

          const translateActions = createTranslateActions(text, messageElement);
          messageElement.appendChild(translateActions);

          outputArea.scrollTop = outputArea.scrollHeight;
      } catch (error) {
          showError('An error occurred while processing your request.');
          console.error(error);
      }
  }

  function createMessageElement(text) {
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.textContent = text;
      return messageElement;
  }

  function createButton(text, onClick) {
      const button = document.createElement('button');
      button.textContent = text;
      button.addEventListener('click', onClick);
      return button;
  }

  function createTranslateActions(text, messageElement) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'message-actions';

      const select = document.createElement('select');
      select.className = 'language-select';
      select.setAttribute('aria-label', 'Select language for translation');
      
      const languages = [
          { code: 'en', name: 'English' },
          { code: 'pt', name: 'Portuguese' },
          { code: 'es', name: 'Spanish' },
          { code: 'ru', name: 'Russian' },
          { code: 'tr', name: 'Turkish' },
          { code: 'fr', name: 'French' }
      ];

      languages.forEach(lang => {
          const option = document.createElement('option');
          option.value = lang.code;
          option.textContent = lang.name;
          select.appendChild(option);
      });

      const translateButton = createButton('Translate', () => translateText(text, select.value, messageElement));

      actionsDiv.appendChild(select);
      actionsDiv.appendChild(translateButton);

      return actionsDiv;
  }

  async function detectLanguage(text) {
      try {
          if (!chrome.languageDetection) {
              console.warn('chrome.languageDetection API not available. Using mock implementation.');
              return 'en';
          }
          const result = await chrome.languageDetection.detectLanguage(text);
          return result.languages[0].language;
      } catch (error) {
          console.error('Language detection failed:', error);
          return 'Unknown';
      }
  }

  async function summarizeText(text, messageElement) {
      try {
          if (!chrome.summarization) {
              console.warn('chrome.summarization API not available. Using mock implementation.');
              const summaryElement = document.createElement('p');
              summaryElement.textContent = `Summary: Mock Summary`;
              messageElement.appendChild(summaryElement);
              return;
          }
          const summary = await chrome.summarization.summarize(text);
          const summaryElement = document.createElement('p');
          summaryElement.textContent = `Summary: ${summary}`;
          messageElement.appendChild(summaryElement);
      } catch (error) {
          showError('Failed to summarize text.');
          console.error(error);
      }
  }

  async function translateText(text, targetLanguage, messageElement) {
      try {
          if (!chrome.translation) {
              console.warn('chrome.translation API not available. Using mock implementation.');
              const translationElement = document.createElement('p');
              translationElement.textContent = `Translation (${targetLanguage}): Mock Translation`;
              messageElement.appendChild(translationElement);
              return;
          }
          const translation = await chrome.translation.translate(text, targetLanguage);
          const translationElement = document.createElement('p');
          translationElement.textContent = `Translation (${targetLanguage}): ${translation}`;
          messageElement.appendChild(translationElement);
      } catch (error) {
          showError('Failed to translate text.');
          console.error(error);
      }
  }

  function showError(message) {
      const errorElement = document.createElement('div');
      errorElement.className = 'error';
      errorElement.textContent = message;
      outputArea.appendChild(errorElement);
      setTimeout(() => errorElement.remove(), 5000);
  }
});