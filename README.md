Sistema de Inventario para Repostería API

1. Descripción del proyecto

Esta API permite gestionar la información de un sistema de inventario para una repostería. Está desarrollada con Node.js y Express, y utiliza MySQL como sistema de gestión de bases de datos.

2. Tecnologías utilizadas

- Node.js: entorno de ejecución de JavaScript.
- Express: framework para desarrollar las rutas de la API.
- MySQL: sistema de gestión de bases de datos.
- HeidiSQL: herramienta para administrar y consultar la base de datos.
- Visual Studio Code: editor de código utilizado para el desarrollo.

3. Funcionalidades

La API cuenta con los siguientes módulos:

- Clientes: consultar y gestionar clientes.
- Materias primas: administrar los ingredientes y sus existencias.
- Movimientos de inventario: registrar entradas, consumos, desperdicios y ajustes.
- Recetas: consultar y gestionar recetas.
- Pedidos: registrar, consultar, actualizar y eliminar pedidos, según las operaciones disponibles.
- Detalles de pedidos: registrar y consultar los pasteles asociados a cada pedido.
- Pagos: registrar pagos y consultar el saldo pendiente de los pedidos.
- Reservas de inventario: registrar reservas de materias primas y gestionar sus estados.

4. Instalación y ejecución

1. Instalar Node.js y MySQL.

2. Abrir el proyecto en Visual Studio Code.

3. Instalar las dependencias con:
   
   "npm install"

4. Configurar las variables de conexión a MySQL en el archivo ".env", según la configuración del proyecto.

5. Iniciar el servidor con:
   
   "npm run dev"

6. Abrir el navegador y comprobar que la API está funcionando:
   
   "http://localhost:3000/api/health"

5. Rutas principales

Método| Ruta| Función
GET| "/"| Verificar el mensaje principal de la API
GET| "/api/health"| Comprobar el estado del servidor
GET| "/api/clientes"| Consultar clientes
GET| "/api/materias-primas"| Consultar materias primas
GET| "/api/movimientos-inventario"| Consultar movimientos
GET| "/api/recetas"| Consultar recetas
GET| "/api/pedidos"| Consultar pedidos
GET| "/api/detalle-pedido"| Consultar detalles de pedidos
GET| "/api/pagos"| Consultar pagos
GET| "/api/reservas-inventario"| Consultar reservas

Los demás métodos y rutas dependen de las operaciones implementadas en cada módulo.

6. Base de datos

La API utiliza una base de datos MySQL llamada "reposteria_db", que almacena la información de clientes, materias primas, recetas, pedidos, detalles de pedidos, pagos, reservas y movimientos de inventario.

7. Pruebas

Las rutas se pueden probar utilizando el navegador para las consultas GET y herramientas como la extensión REST Client de Visual Studio Code para solicitudes POST, PUT, PATCH y DELETE.

8. Objetivo

Facilitar la administración de los pedidos, los pagos y las existencias de materias primas de una repostería mediante una API organizada por módulos.