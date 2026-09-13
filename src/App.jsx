import { useEffect, useState } from "react";
import "./App.css";

const productosIniciales = [
  {
    id: 1,
    nombre: "Laptop Pro",
    precio: 18999,
    categoria: "Computadoras",
    descripcion: "Laptop de alto rendimiento para trabajo y estudio."
  },
  {
    id: 2,
    nombre: "Smartphone X",
    precio: 8499,
    categoria: "Telefonía",
    descripcion: "Smartphone con pantalla de alta resolución y gran rendimiento."
  },
  {
    id: 3,
    nombre: "Audífonos Inalámbricos",
    precio: 1599,
    categoria: "Audio",
    descripcion: "Audífonos inalámbricos con sonido de alta calidad."
  },
  {
    id: 4,
    nombre: "Monitor Full HD",
    precio: 4299,
    categoria: "Computadoras",
    descripcion: "Monitor de 24 pulgadas con resolución Full HD."
  },
  {
    id: 5,
    nombre: "Teclado Mecánico",
    precio: 1299,
    categoria: "Accesorios",
    descripcion: "Teclado mecánico diseñado para trabajo y videojuegos."
  },
  {
    id: 6,
    nombre: "Mouse Inalámbrico",
    precio: 699,
    categoria: "Accesorios",
    descripcion: "Mouse inalámbrico ergonómico de alta precisión."
  }
];

function App() {
  const [vista, setVista] = useState("inicio");

  const [usuarios, setUsuarios] = useState(() => {
    const usuariosGuardados = localStorage.getItem("usuarios");
    return usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
  });

  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuarioActivo");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem("carrito");
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

  const [mensaje, setMensaje] = useState("");

  const [registro, setRegistro] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmarPassword: ""
  });

  const [login, setLogin] = useState({
    correo: "",
    password: ""
  });

  useEffect(() => {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    if (usuarioActivo) {
      localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));
    } else {
      localStorage.removeItem("usuarioActivo");
    }
  }, [usuarioActivo]);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);

    setTimeout(() => {
      setMensaje("");
    }, 3000);
  };

  const registrarUsuario = (e) => {
    e.preventDefault();

    if (
      !registro.nombre ||
      !registro.correo ||
      !registro.password ||
      !registro.confirmarPassword
    ) {
      mostrarMensaje("Todos los campos son obligatorios.");
      return;
    }

    if (registro.password !== registro.confirmarPassword) {
      mostrarMensaje("Las contraseñas no coinciden.");
      return;
    }

    const correoExiste = usuarios.some(
      (usuario) =>
        usuario.correo.toLowerCase() === registro.correo.toLowerCase()
    );

    if (correoExiste) {
      mostrarMensaje("El correo electrónico ya está registrado.");
      return;
    }

    const nuevoUsuario = {
      id: Date.now(),
      nombre: registro.nombre,
      correo: registro.correo,
      password: registro.password
    };

    setUsuarios([...usuarios, nuevoUsuario]);

    setRegistro({
      nombre: "",
      correo: "",
      password: "",
      confirmarPassword: ""
    });

    mostrarMensaje("Registro completado correctamente.");

    setTimeout(() => {
      setVista("login");
    }, 1000);
  };

  const iniciarSesion = (e) => {
    e.preventDefault();

    if (!login.correo || !login.password) {
      mostrarMensaje("Ingresa tu correo y contraseña.");
      return;
    }

    const usuarioEncontrado = usuarios.find(
      (usuario) =>
        usuario.correo.toLowerCase() === login.correo.toLowerCase() &&
        usuario.password === login.password
    );

    if (!usuarioEncontrado) {
      mostrarMensaje("Correo o contraseña incorrectos.");
      return;
    }

    setUsuarioActivo(usuarioEncontrado);

    setLogin({
      correo: "",
      password: ""
    });

    mostrarMensaje("Inicio de sesión exitoso.");

    setTimeout(() => {
      setVista("catalogo");
    }, 1000);
  };

  const cerrarSesion = () => {
    setUsuarioActivo(null);
    setVista("inicio");
    mostrarMensaje("Sesión cerrada correctamente.");
  };

  const agregarAlCarrito = (producto) => {
    if (!usuarioActivo) {
      mostrarMensaje("Debes iniciar sesión para agregar productos.");
      setVista("login");
      return;
    }

    const productoExistente = carrito.find(
      (item) => item.id === producto.id
    );

    if (productoExistente) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          ...producto,
          cantidad: 1
        }
      ]);
    }

    mostrarMensaje("Producto agregado al carrito.");
  };

  const aumentarCantidad = (id) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  const disminuirCantidad = (id) => {
    setCarrito(
      carrito
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
    mostrarMensaje("Producto eliminado del carrito.");
  };

  const calcularTotal = () => {
    return carrito.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );
  };

  const formatearPrecio = (precio) => {
    return precio.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN"
    });
  };

  const finalizarCompra = () => {
    if (carrito.length === 0) {
      mostrarMensaje("El carrito está vacío.");
      return;
    }

    setCarrito([]);
    mostrarMensaje("Compra de demostración realizada correctamente.");
  };

  return (
    <div className="app">
      <header className="header">
        <div className="contenedor header-contenido">
          <button
            className="logo"
            onClick={() => setVista("inicio")}
          >
            Comercio Electrónico
          </button>

          <nav className="nav">
            <button onClick={() => setVista("inicio")}>
              Inicio
            </button>

            <button onClick={() => setVista("catalogo")}>
              Catálogo
            </button>

            <button onClick={() => setVista("carrito")}>
              Carrito ({carrito.reduce((total, item) => total + item.cantidad, 0)})
            </button>

            {!usuarioActivo ? (
              <>
                <button onClick={() => setVista("registro")}>
                  Registro
                </button>

                <button onClick={() => setVista("login")}>
                  Iniciar sesión
                </button>
              </>
            ) : (
              <button onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      </header>

      {mensaje && (
        <div className="mensaje">
          {mensaje}
        </div>
      )}

      <main className="contenedor contenido">

        {vista === "inicio" && (
          <section className="inicio">
            <div className="inicio-texto">
              <h1>Aplicación de Comercio Electrónico</h1>

              <p>
                Plataforma de demostración desarrollada para gestionar
                usuarios, consultar productos y administrar un carrito
                de compras.
              </p>

              <div className="botones-inicio">
                <button
                  className="boton principal"
                  onClick={() => setVista("catalogo")}
                >
                  Ver catálogo
                </button>

                {!usuarioActivo && (
                  <button
                    className="boton secundario"
                    onClick={() => setVista("registro")}
                  >
                    Crear cuenta
                  </button>
                )}
              </div>
            </div>

            <div className="panel-informacion">
              <h2>Funciones principales</h2>

              <ul>
                <li>Registro de usuarios</li>
                <li>Inicio de sesión</li>
                <li>Catálogo de productos</li>
                <li>Carrito de compras</li>
                <li>Control de cantidades</li>
                <li>Cálculo automático del total</li>
              </ul>
            </div>
          </section>
        )}

        {vista === "registro" && (
          <section className="formulario-seccion">
            <div className="formulario">
              <h1>Registro de Usuario</h1>

              <p className="descripcion">
                Crea una cuenta para acceder al catálogo y administrar
                tus productos.
              </p>

              <form onSubmit={registrarUsuario}>
                <label>Nombre completo</label>

                <input
                  type="text"
                  value={registro.nombre}
                  onChange={(e) =>
                    setRegistro({
                      ...registro,
                      nombre: e.target.value
                    })
                  }
                  placeholder="Ingresa tu nombre"
                />

                <label>Correo electrónico</label>

                <input
                  type="email"
                  value={registro.correo}
                  onChange={(e) =>
                    setRegistro({
                      ...registro,
                      correo: e.target.value
                    })
                  }
                  placeholder="ejemplo@correo.com"
                />

                <label>Contraseña</label>

                <input
                  type="password"
                  value={registro.password}
                  onChange={(e) =>
                    setRegistro({
                      ...registro,
                      password: e.target.value
                    })
                  }
                  placeholder="Ingresa una contraseña"
                />

                <label>Confirmar contraseña</label>

                <input
                  type="password"
                  value={registro.confirmarPassword}
                  onChange={(e) =>
                    setRegistro({
                      ...registro,
                      confirmarPassword: e.target.value
                    })
                  }
                  placeholder="Confirma tu contraseña"
                />

                <button
                  type="submit"
                  className="boton principal ancho-completo"
                >
                  Registrar usuario
                </button>
              </form>

              <button
                className="enlace"
                onClick={() => setVista("login")}
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </button>
            </div>
          </section>
        )}

        {vista === "login" && (
          <section className="formulario-seccion">
            <div className="formulario">
              <h1>Inicio de Sesión</h1>

              <p className="descripcion">
                Ingresa tus datos para acceder a la aplicación.
              </p>

              <form onSubmit={iniciarSesion}>
                <label>Correo electrónico</label>

                <input
                  type="email"
                  value={login.correo}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      correo: e.target.value
                    })
                  }
                  placeholder="ejemplo@correo.com"
                />

                <label>Contraseña</label>

                <input
                  type="password"
                  value={login.password}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      password: e.target.value
                    })
                  }
                  placeholder="Ingresa tu contraseña"
                />

                <button
                  type="submit"
                  className="boton principal ancho-completo"
                >
                  Iniciar sesión
                </button>
              </form>

              <button
                className="enlace"
                onClick={() => setVista("registro")}
              >
                ¿No tienes una cuenta? Regístrate
              </button>
            </div>
          </section>
        )}

        {vista === "catalogo" && (
          <section className="catalogo">
            <div className="titulo-seccion">
              <div>
                <h1>Catálogo de Productos</h1>

                <p>
                  Consulta los productos disponibles y agrégalos al
                  carrito.
                </p>
              </div>
            </div>

            <div className="productos">
              {productosIniciales.map((producto) => (
                <article className="producto" key={producto.id}>
                  <div className="producto-imagen">
                    <span>PRODUCTO</span>
                  </div>

                  <div className="producto-contenido">
                    <span className="categoria">
                      {producto.categoria}
                    </span>

                    <h2>{producto.nombre}</h2>

                    <p>{producto.descripcion}</p>

                    <strong>
                      {formatearPrecio(producto.precio)}
                    </strong>

                    <button
                      className="boton principal ancho-completo"
                      onClick={() => agregarAlCarrito(producto)}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {vista === "carrito" && (
          <section className="carrito-seccion">
            <div className="titulo-seccion">
              <div>
                <h1>Carrito de Compras</h1>

                <p>
                  Revisa los productos seleccionados antes de finalizar
                  la compra.
                </p>
              </div>
            </div>

            {carrito.length === 0 ? (
              <div className="carrito-vacio">
                <h2>El carrito está vacío</h2>

                <p>
                  Agrega productos desde el catálogo para continuar.
                </p>

                <button
                  className="boton principal"
                  onClick={() => setVista("catalogo")}
                >
                  Ir al catálogo
                </button>
              </div>
            ) : (
              <div className="carrito-contenido">
                <div className="lista-carrito">
                  {carrito.map((item) => (
                    <article
                      className="item-carrito"
                      key={item.id}
                    >
                      <div className="item-informacion">
                        <div className="producto-mini">
                          PRODUCTO
                        </div>

                        <div>
                          <h2>{item.nombre}</h2>

                          <p>
                            {formatearPrecio(item.precio)} por unidad
                          </p>
                        </div>
                      </div>

                      <div className="cantidad">
                        <button
                          onClick={() =>
                            disminuirCantidad(item.id)
                          }
                        >
                          -
                        </button>

                        <span>{item.cantidad}</span>

                        <button
                          onClick={() =>
                            aumentarCantidad(item.id)
                          }
                        >
                          +
                        </button>
                      </div>

                      <strong>
                        {formatearPrecio(
                          item.precio * item.cantidad
                        )}
                      </strong>

                      <button
                        className="boton eliminar"
                        onClick={() =>
                          eliminarDelCarrito(item.id)
                        }
                      >
                        Eliminar
                      </button>
                    </article>
                  ))}
                </div>

                <aside className="resumen">
                  <h2>Resumen de compra</h2>

                  <div className="resumen-linea">
                    <span>Productos</span>
                    <span>
                      {carrito.reduce(
                        (total, item) => total + item.cantidad,
                        0
                      )}
                    </span>
                  </div>

                  <div className="resumen-total">
                    <span>Total</span>
                    <strong>
                      {formatearPrecio(calcularTotal())}
                    </strong>
                  </div>

                  <button
                    className="boton principal ancho-completo"
                    onClick={finalizarCompra}
                  >
                    Finalizar compra de demostración
                  </button>
                </aside>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>
          Aplicación de Comercio Electrónico | Sprint 1
        </p>
      </footer>
    </div>
  );
}

export default App;