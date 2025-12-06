Security Configuration: This project uses Environment Variables to protect sensitive API keys.

1.) The .env file containing the live GEMINI_API_KEY is included in .gitignore and is never committed to the repository.

2.) A .env.example file is provided as a template for developers to set up their own local environment securely.

3.) The React Frontend does not store or access the API key; it is routed securely through the Proxy Server.
