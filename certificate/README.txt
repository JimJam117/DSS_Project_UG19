TO INSTALL THE HTTPS CERTIFICATES:

1. Install mkcert to create a signed certificate (You will need to install chocolately if you haven't already):

choco install mkcert

2. Setup mkcert to be a trusted certificate authority on your system, accept the dialogue options

mkcert install

3a. Create the certificates needed for the website to run. First open VS Code and navigate to the certificate folder

cd certificate

3b. Create the certificates

mkcert localhost

4. All done just navigate to the new url! (you might need to restart your browser)

https://localhost:5000/