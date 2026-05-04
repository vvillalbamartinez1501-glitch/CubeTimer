import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="google-site-verification" content="hZVhhvBT_QA1GZ6UGZOeQ_x0LyhqK-hdQ77FgxZHfwE" />
        
        {/* Basic SEO */}
        <title>CubeTimer - Temporizador y Entrenador de Speedcubing</title>
        <meta name="description" content="CubeTimer es la herramienta definitiva para speedcubers. Cronometra tus tiempos, aprende métodos (CFOP, Principiante) y domina los algoritmos OLL y PLL." />
        <meta name="keywords" content="cube timer, cronometro cubo rubik, cronometro cubo ricuk, rubiks cube timer, speedcubing timer, oll algorithms, pll algorithms, cfop method, f2l algorithms, gan cube timer, cstimer alternative, rubik timer online, entrenar cubo rubik, mejorar tiempos cubo, algoritmos 3x3, cubing trainer, speedcubing, cubo de rubik, timer, temporizador, algoritmos, OLL, PLL, CFOP, aprender cubo" />
        <meta name="author" content="CubeTimer" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CubeTimer - Temporizador de Speedcubing" />
        <meta property="og:description" content="Cronometra tus tiempos y aprende métodos y algoritmos para mejorar en el Cubo de Rubik." />
        <meta property="og:site_name" content="CubeTimer" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="CubeTimer - Temporizador de Speedcubing" />
        <meta name="twitter:description" content="Cronometra tus tiempos y aprende métodos y algoritmos para mejorar en el Cubo de Rubik." />

        {/* PWA & Mobile Settings */}
        <meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CubeTimer" />
        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
