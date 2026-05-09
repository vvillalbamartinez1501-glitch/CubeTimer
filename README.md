# 🧩 CubeTimer Pro - Speedcubing Timer & Academy

![Expo](https://img.shields.io/badge/Framework-Expo-4630EB.svg?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-Multilingual-green?style=for-the-badge)

**CubeTimer Pro** es una plataforma integral para entusiastas del speedcubing desarrollada con **React Native y Expo**. A diferencia de los cronómetros básicos, esta aplicación combina herramientas de competición profesional con una academia de aprendizaje completa, funcionando de manera fluida en Android, iOS y Web.

## 🚀 Características Principales

### ⏱️ Cronómetro de Competición
- **Alta Precisión:** Motor optimizado con `requestAnimationFrame` para capturar milisegundos reales sin lag.
- **Reglas WCA:** Tiempo de inspección opcional de 15 segundos con avisos de penalización (+2s).
- **Control Universal:** 
  - Móvil: Inicio al soltar (hold-to-start) y parada táctil.
  - Web: Soporte completo para la **Barra Espaciadora**.
- **Post-Solve:** Opciones rápidas tras cada resolución (+2s, DNF/Eliminar, Guardar).

### 🧩 Gestión de Puzzles y Scrambles
- **Generador de Mezclas:** Algoritmos aleatorios para:
  - Cubos NxN (2x2 hasta 9x9).
  - WCA: Pyraminx, Megaminx, Skewb, Square-1, Clock.
  - Variantes: Mirror (2x2-5x5), Ghost Cube.
- **Categorías Personalizadas:** Crea tus propias categorías para cuboides o modificaciones raras.

### 📊 Historial y Estadísticas
- **Persistencia Local:** Almacenamiento seguro mediante `expo-sqlite`.
- **Análisis de Rendimiento:** 
  - Cálculo de **Personal Best (PB)**.
  - Promedios automáticos de **Ao5** (Average of 5) y **Ao12**.
- **Filtros Inteligentes:** Visualiza tu historial por tipo de cubo o usuario.

### 🎓 Academia (Sección Aprender)
- **Tutoriales por Niveles:** Guías paso a paso para resolver 2x2, 3x3, 4x4 y Megaminx.
- **Biblioteca de Algoritmos:** Guía completa de **CFOP** (Cross, F2L, OLL, PLL).
- **Sección Avanzada:** Tips sobre Look-ahead, Fingertricks y Neutralidad de Color.

### 🌐 Multilenguaje
- Soporte nativo para: **Español, Inglés, Francés, Hindi y Mandarín**.
- Detección automática según la configuración regional del dispositivo.

## 🛠️ Stack Tecnológico

- **Framework:** [Expo](https://expo.dev/) (React Native)
- **Navegación:** Expo Router (File-based routing)
- **Estado Global:** [Zustand](https://github.com/pmndrs/zustand)
- **Base de Datos:** SQLite via `expo-sqlite`
- **Traducciones:** `i18next` & `react-i18next`
- **Iconos:** Ionicons (@expo/vector-icons)


🗺️ Próximos Pasos (Roadmap)
[ ] Sincronización Cloud: Integración con Supabase para cuentas de usuario.

[ ] Modo Entrenamiento: Práctica específica de algoritmos OLL/PLL.

[ ] Gráficos: Visualización de tendencias y progreso temporal.

Lanzar la build :
eas build -p android --profile preview

Desarrollado con ❤️ por vvillalbamartinez - Speedcuber & Developer
