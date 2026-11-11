import { useEffect, useMemo, useState } from "react";
import "./App.css";
import "./AppSprint2.css";

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

const leerLocalStorage = (clave, valorInicial) => {
  try {
    const valorGuardado = window.localStorage.getItem(clave);
    return valorGuardado ? JSON.parse(valorGuardado) : valorInicial;
  } catch {
    return valorInicial;
  }
};

const guardarLocalStorage = (clave, valor) => {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.error(`No se pudo guardar "${clave}" en el almacenamiento local:`, error);
    return false;
  }
};

function App() {
  const [vista, setVista] = useState("inicio");

  const [usuarios, setUsuarios] = useState(() => {
    const valor = leerLocalStorage("usuarios", []);
    return Array.isArray(valor) ? valor : [];
  });

  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    const valor = leerLocalStorage("usuarioActivo", null);
    return valor && typeof valor === "object" ? valor : null;
  });

  const [carrito, setCarrito] = useState(() => {
    const valor = leerLocalStorage("carrito", []);
    return Array.isArray(valor) ? valor : [];
  });

  const [pedidos, setPedidos] = useState(() => {
    const valor = leerLocalStorage("pedidos", []);
    return Array.isArray(valor) ? valor : [];
  });

  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

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
    guardarLocalStorage("usuarios", usuarios);
  }, [usuarios]);

  useEffect(() => {
    guardarLocalStorage("carrito", carrito);
  }, [carrito]);

  useEffect(() => {
    guardarLocalStorage("pedidos", pedidos);
  }, [pedidos]);

  useEffect(() => {
    if (usuarioActivo) {
      guardarLocalStorage("usuarioActivo", usuarioActivo);
    } else {
      try {
        window.localStorage.removeItem("usuarioActivo");
      } catch (error) {
        console.error("No se pudo limpiar la sesión:", error);
      }
    }
  }, [usuarioActivo]);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
  };

  useEffect(() => {
    if (!mensaje) return undefined;

    const temporizador = setTimeout(() => {
      setMensaje("");
    }, 3000);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  const formatearPrecio = (precio) => {
    const cantidad = Number(precio);
    return (Number.isFinite(cantidad) ? cantidad : 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN"
    });
  };

  const formatearFecha = (fecha) => {
    const fechaValida = new Date(fecha);
    return Number.isNaN(fechaValida.getTime())
      ? "Fecha no disponible"
      : fechaValida.toLocaleString("es-MX", {
          dateStyle: "medium",
          timeStyle: "short"
        });
  };

  const categorias = useMemo(
    () => [
      "Todas",
      ...new Set(productosIniciales.map((producto) => producto.categoria))
    ],
    []
  );

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return productosIniciales.filter((producto) => {
      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(termino) ||
        producto.descripcion.toLowerCase().includes(termino) ||
        producto.categoria.toLowerCase().includes(termino);

      const coincideCategoria =
        categoriaSeleccionada === "Todas" ||
        producto.categoria === categoriaSeleccionada;

      return coincideBusqueda && coincideCategoria;
    });
  }, [busqueda, categoriaSeleccionada]);

  const registrarUsuario = (e) => {
    e.preventDefault();

    const nombre = registro.nombre.trim();
    const correo = registro.correo.trim().toLowerCase();

    if (
      !nombre ||
      !correo ||
      !registro.password ||
      !registro.confirmarPassword
    ) {
      mostrarMensaje("Todos los campos son obligatorios.");
      return;
    }

    if (registro.password.length < 8) {
      mostrarMensaje("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (registro.password !== registro.confirmarPassword) {
      mostrarMensaje("Las contraseñas no coinciden.");
      return;
    }

    const correoExiste = usuarios.some(
      (usuario) =>
        String(usuario.correo || "").trim().toLowerCase() === correo
    );

    if (correoExiste) {
      mostrarMensaje("El correo electrónico ya está registrado.");
      return;
    }

    const nuevoUsuario = {
      id: Date.now(),
      nombre,
      correo,
      password: registro.password
    };

    setUsuarios((usuariosActuales) => [
      ...usuariosActuales,
      nuevoUsuario
    ]);

    setRegistro({
      nombre: "",
      correo: "",
      password: "",
      confirmarPassword: ""
    });

    mostrarMensaje("Registro completado. Inicia sesión para continuar.");
    setVista("login");
  };

  const iniciarSesion = (e) => {
    e.preventDefault();

    const correo = login.correo.trim().toLowerCase();

    if (!correo || !login.password) {
      mostrarMensaje("Ingresa tu correo y contraseña.");
      return;
    }

    const usuarioEncontrado = usuarios.find(
      (usuario) =>
        String(usuario.correo || "").trim().toLowerCase() === correo &&
        usuario.password === login.password
    );

    if (!usuarioEncontrado) {
      mostrarMensaje("Correo o contraseña incorrectos.");
      return;
    }

    // Cada sesión comienza con un carrito independiente.
    setCarrito([]);
    setUsuarioActivo({
      id: usuarioEncontrado.id,
      nombre: usuarioEncontrado.nombre,
      correo: usuarioEncontrado.correo
    });

    setLogin({
      correo: "",
      password: ""
    });

    mostrarMensaje("Inicio de sesión exitoso.");
    setVista("catalogo");
  };

  const cerrarSesion = () => {
    // Evita que otra cuenta pueda ver o utilizar el carrito anterior.
    setCarrito([]);
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

    setCarrito((carritoActual) => {
      const productoExistente = carritoActual.find(
        (item) => item.id === producto.id
      );

      if (productoExistente) {
        return carritoActual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: Number(item.cantidad || 0) + 1 }
            : item
        );
      }

      return [...carritoActual, { ...producto, cantidad: 1 }];
    });

    mostrarMensaje("Producto agregado al carrito.");
  };

  const aumentarCantidad = (id) => {
    setCarrito((carritoActual) =>
      carritoActual.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.min(99, Math.max(1, Number(item.cantidad) || 1) + 1) }
          : item
      )
    );
  };

  const disminuirCantidad = (id) => {
    setCarrito((carritoActual) =>
      carritoActual
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: Number(item.cantidad || 0) - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== id)
    );

    mostrarMensaje("Producto eliminado del carrito.");
  };

  const calcularTotal = (items = carrito) =>
    items.reduce((total, item) => {
      const precio = Number(item.precio);
      const cantidad = Number(item.cantidad);
      if (!Number.isFinite(precio) || !Number.isFinite(cantidad)) return total;
      return total + Math.max(0, precio) * Math.max(0, cantidad);
    }, 0);

  const obtenerIdentificadorUsuario = (usuario) => {
    if (!usuario) return null;

    const identificador =
      usuario.id ?? usuario.correo ?? usuario.email;

    return identificador == null
      ? null
      : String(identificador).trim().toLowerCase();
  };
    const finalizarCompra = () => {
    if (!usuarioActivo) {
      mostrarMensaje("Inicia sesión para registrar tu pedido.");
      setVista("login");
      return;
    }

    if (!Array.isArray(carrito) || carrito.length === 0) {
      mostrarMensaje(
        "El carrito está vacío. Agrega un producto antes de continuar."
      );
      return;
    }

    const usuarioId = obtenerIdentificadorUsuario(usuarioActivo);

    if (!usuarioId) {
      mostrarMensaje(
        "No se pudo identificar tu cuenta. Cierra sesión e inicia nuevamente."
      );
      return;
    }

    const productosPedido = carrito
      .filter((item) => item && item.id != null && item.nombre)
      .map((item) => ({
        ...item,
        precio: Math.max(0, Number(item.precio) || 0),
        cantidad: Math.min(99, Math.max(1, Number(item.cantidad) || 1))
      }));

    if (productosPedido.length === 0) {
      mostrarMensaje("No hay productos válidos para registrar el pedido.");
      return;
    }

    const nuevoPedido = {
      id: `PED-${Date.now()}`,
      usuarioId,
      usuarioCorreo: String(
        usuarioActivo.correo ?? usuarioActivo.email ?? ""
      )
        .trim()
        .toLowerCase(),
      usuarioNombre: usuarioActivo.nombre ?? "Usuario",
      fecha: new Date().toISOString(),
      productos: productosPedido,
      total: calcularTotal(productosPedido),
      estado: "Registrado (demostración)"
    };

    try {
      const pedidosGuardados = leerLocalStorage("pedidos", []);
      const listaActual = Array.isArray(pedidosGuardados)
        ? pedidosGuardados.filter(Boolean)
        : [];

      const pedidosActualizados = [nuevoPedido, ...listaActual];
      const pedidoGuardado = guardarLocalStorage("pedidos", pedidosActualizados);

      if (!pedidoGuardado) {
        throw new Error("No fue posible guardar el pedido.");
      }

      guardarLocalStorage("carrito", []);
      setPedidos(pedidosActualizados);
      setCarrito([]);

      mostrarMensaje("Pedido de demostración registrado correctamente.");
      setVista("pedidos");
    } catch (error) {
      console.error(
        "No se pudo guardar el pedido en el almacenamiento local:",
        error
      );

      mostrarMensaje(
        "No se pudo guardar el pedido. Revisa el almacenamiento del navegador."
      );
    }
  };

  const pedidosDelUsuario = (
    Array.isArray(pedidos) ? pedidos : []
  ).filter((pedido) => {
    if (!usuarioActivo || !pedido) return false;

    const idActivo = obtenerIdentificadorUsuario(usuarioActivo);

    const idPedido =
      pedido.usuarioId == null
        ? ""
        : String(pedido.usuarioId).trim().toLowerCase();

    const correoActivo = String(
      usuarioActivo.correo ?? usuarioActivo.email ?? ""
    )
      .trim()
      .toLowerCase();

    const correoPedido = String(
      pedido.usuarioCorreo ?? pedido.usuarioEmail ?? ""
    )
      .trim()
      .toLowerCase();

    return Boolean(
      (idActivo && idPedido && idActivo === idPedido) ||
      (correoActivo && correoPedido && correoActivo === correoPedido)
    );
  });

  const cantidadProductosCarrito = carrito.reduce(
    (total, item) => total + Number(item.cantidad || 0),
    0
  );

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

          <nav className="nav" aria-label="Navegación principal">
            <button onClick={() => setVista("inicio")}>
              Inicio
            </button>

            <button onClick={() => setVista("catalogo")}>
              Catálogo
            </button>

            <button
              onClick={() => {
                if (!usuarioActivo) {
                  mostrarMensaje("Inicia sesión para consultar tu carrito.");
                  setVista("login");
                  return;
                }
                setVista("carrito");
              }}
            >
              Carrito ({cantidadProductosCarrito})
            </button>

            {usuarioActivo && (
              <button onClick={() => setVista("pedidos")}>
                Mis pedidos
              </button>
            )}

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
              <>
                <span className="usuario-saludo">
                  Hola, {usuarioActivo.nombre}
                </span>

                <button onClick={cerrarSesion}>
                  Cerrar sesión
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {mensaje && (
        <div
          className="mensaje"
          role="status"
          aria-live="polite"
        >
          {mensaje}
        </div>
      )}

      <main className="contenedor contenido">
        {vista === "inicio" && (
          <section className="inicio">
            <div className="inicio-texto">
              <h1>Aplicación de Comercio Electrónico</h1>

              <p>
                Plataforma de demostración para consultar productos,
                administrar un carrito y revisar los pedidos registrados.
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
                <li>Registro e inicio de sesión de demostración</li>
                <li>Catálogo con búsqueda y filtros</li>
                <li>Carrito y cálculo automático del total</li>
                <li>Registro e historial de pedidos de demostración</li>
              </ul>
              <p className="nota-seguridad">
                Proyecto académico: los datos se almacenan localmente en este navegador.
                No se realizan pagos reales.
              </p>
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
                <label htmlFor="registro-nombre">
                  Nombre completo
                </label>

                <input
                  id="registro-nombre"
                  type="text"
                  autoComplete="name"
                  value={registro.nombre}
                  onChange={(e) =>
                    setRegistro({
                      ...registro,
                      nombre: e.target.value
                    })
                  }
                  placeholder="Ingresa tu nombre"
                  required
                />

                <label htmlFor="registro-correo">
                  Correo electrónico
                </label>

                <input
                  id="registro-correo"
                  type="email"
                  autoComplete="email"
                  value={registro.correo}
                  onChange={(e) =>
                    setRegistro({
                      ...registro,
                      correo: e.target.value
                    })
                  }
                  placeholder="ejemplo@correo.com"
                  required
                />

                <label htmlFor="registro-password">
                  Contraseña
                </label>

                <input
                  id="registro-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={registro.password}
                  onChange={(e) =>
                    setRegistro({
                      ...registro,
                      password: e.target.value
                    })
                  }
                  placeholder="Mínimo 8 caracteres"
                  required
                />

                <label htmlFor="registro-confirmar">
                  Confirmar contraseña
                </label>

                <input
                  id="registro-confirmar"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={registro.confirmarPassword}
                  onChange={(e) =>
                    setRegistro({
                      ...registro,
                      confirmarPassword: e.target.value
                    })
                  }
                  placeholder="Confirma tu contraseña"
                  required
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
                <label htmlFor="login-correo">
                  Correo electrónico
                </label>

                <input
                  id="login-correo"
                  type="email"
                  autoComplete="email"
                  value={login.correo}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      correo: e.target.value
                    })
                  }
                  placeholder="ejemplo@correo.com"
                  required
                />

                <label htmlFor="login-password">
                  Contraseña
                </label>

                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={login.password}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      password: e.target.value
                    })
                  }
                  placeholder="Ingresa tu contraseña"
                  required
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
                  Busca productos por nombre o descripción y filtra
                  por categoría.
                </p>
              </div>
            </div>

            <div className="filtros-catalogo">
              <div className="campo-filtro">
                <label htmlFor="buscar-producto">
                  Buscar productos
                </label>

                <input
                  id="buscar-producto"
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej. laptop, audio..."
                />
              </div>

              <div className="campo-filtro">
                <label htmlFor="filtro-categoria">
                  Categoría
                </label>

                <select
                  id="filtro-categoria"
                  value={categoriaSeleccionada}
                  onChange={(e) =>
                    setCategoriaSeleccionada(e.target.value)
                  }
                >
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="boton secundario"
                onClick={() => {
                  setBusqueda("");
                  setCategoriaSeleccionada("Todas");
                }}
              >
                Limpiar filtros
              </button>
            </div>

            {productosFiltrados.length === 0 ? (
              <div className="carrito-vacio">
                <h2>No se encontraron productos</h2>
                <p>
                  Prueba con otro término o selecciona una categoría distinta.
                </p>
              </div>
            ) : (
              <div className="productos">
                {productosFiltrados.map((producto) => (
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
            )}
          </section>
        )}

        {vista === "carrito" && (
          <section className="carrito-seccion">
            <div className="titulo-seccion">
              <div>
                <h1>Carrito de Compras</h1>
                <p>
                  Revisa los productos seleccionados antes de registrar
                  el pedido.
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
                    <article className="item-carrito" key={item.id}>
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
                          aria-label={`Disminuir cantidad de ${item.nombre}`}
                          onClick={() => disminuirCantidad(item.id)}
                        >
                          -
                        </button>

                        <span>{item.cantidad}</span>

                        <button
                          aria-label={`Aumentar cantidad de ${item.nombre}`}
                          onClick={() => aumentarCantidad(item.id)}
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
                        onClick={() => eliminarDelCarrito(item.id)}
                      >
                        Eliminar
                      </button>
                    </article>
                  ))}
                </div>

                <aside className="resumen">
                  <h2>Resumen de compra</h2>

                  <div className="resumen-linea">
                    <span>Unidades</span>
                    <span>{cantidadProductosCarrito}</span>
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
                    Registrar pedido de demostración
                  </button>

                  <p className="nota-demostracion">
                    Esta función registra un pedido de prueba.
                    No procesa pagos.
                  </p>
                </aside>
              </div>
            )}
          </section>
        )}

        {vista === "pedidos" && (
          <section className="pedidos-seccion">
            <div className="titulo-seccion">
              <div>
                <h1>Mis pedidos</h1>
                <p>
                  Historial de los pedidos de demostración de tu cuenta.
                </p>
              </div>
            </div>

            {!usuarioActivo ? (
              <div className="carrito-vacio">
                <h2>Inicia sesión para consultar tus pedidos</h2>

                <button
                  className="boton principal"
                  onClick={() => setVista("login")}
                >
                  Iniciar sesión
                </button>
              </div>
            ) : pedidosDelUsuario.length === 0 ? (
              <div className="carrito-vacio">
                <h2>Aún no tienes pedidos</h2>

                <p>
                  Cuando registres una compra de demostración,
                  aparecerá aquí.
                </p>

                <button
                  className="boton principal"
                  onClick={() => setVista("catalogo")}
                >
                  Explorar catálogo
                </button>
              </div>
            ) : (
              <div className="lista-pedidos">
                {pedidosDelUsuario.map((pedido, indice) => {
                  const productosPedido = Array.isArray(pedido.productos)
                    ? pedido.productos.filter(Boolean)
                    : [];
                  const totalPedido = Number.isFinite(Number(pedido.total))
                    ? Number(pedido.total)
                    : calcularTotal(productosPedido);

                  return (
                    <article className="pedido" key={pedido.id || `pedido-${indice}`}>
                      <div className="pedido-encabezado">
                        <div>
                          <h2>{pedido.id || "Pedido sin folio"}</h2>
                          <p>Fecha: {formatearFecha(pedido.fecha)}</p>
                        </div>

                        <span className="estado-pedido">
                          {pedido.estado || "Registrado"}
                        </span>
                      </div>

                      {productosPedido.length > 0 ? (
                        <ul className="pedido-productos">
                          {productosPedido.map((producto, productoIndice) => {
                            const cantidad = Math.max(1, Number(producto.cantidad) || 1);
                            const precio = Math.max(0, Number(producto.precio) || 0);

                            return (
                              <li key={`${pedido.id || indice}-${producto.id || productoIndice}`}>
                                <span>
                                  {producto.nombre || "Producto"} × {cantidad}
                                </span>
                                <strong>{formatearPrecio(precio * cantidad)}</strong>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="pedido-sin-productos">
                          No hay detalles de productos disponibles para este pedido.
                        </p>
                      )}

                      <div className="resumen-total">
                        <span>Total del pedido</span>
                        <strong>{formatearPrecio(totalPedido)}</strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>
          Aplicación de Comercio Electrónico | Entrega final del proyecto
        </p>
      </footer>
    </div>
  );
}

export default App;