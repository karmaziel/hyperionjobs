CREATE TABLE users (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE empresas (
  id_empresa VARCHAR(10) PRIMARY KEY,
  name_empresa VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL
  num_trabajos INT NOT NULL
);

CREATE TABLE trabajos (
  id_Trabajo VARCHAR(10) PRIMARY KEY,
  categoria VARCHAR(50) NOT NULL,
  name_trabajo VARCHAR(50) NOT NULL,
  descripcion VARCHAR(225) NOT NULL,
  vacantes INT NOT NULL,
  sueldo MONEY NOT NULL,
  fecha_limite DATE NOT NULL,
  ubicacion VARCHAR(225) NOT NULL

);