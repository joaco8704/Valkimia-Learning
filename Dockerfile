# Utiliza una imagen de Node.js como base
FROM node:latest

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo package.json y package-lock.json (o yarn.lock si utilizas Yarn)
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos del proyecto al directorio de trabajo
COPY . .

# Compila TypeScript (si es necesario)
RUN npm run build

# Expone el puerto en el que la aplicación va a escuchar
EXPOSE 3000

# Define el comando para ejecutar la aplicación
CMD ["node", "dist/app.js"]
