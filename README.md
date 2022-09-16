<!-- PROJECT LOGO -->
<br />
<div align="center">
   <h1 align="center"> INFINITY BET</h1>

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Tabla de contenidos</summary>
  <ol>
    <li>
      <a href="#about-the-project">Acerca del proyecto</a>
      <ul>
        <li><a href="#built-with">Tecnologías utilizadas</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisitos</a></li>
        <li><a href="#installation">Instalación</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contribución</a></li>
    <li><a href="#license">Licencia</a></li>
    <li><a href="#contact">Contacto</a></li>
    <li><a href="#acknowledgments">Reconocimientos</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## Acerca del Proyecto

Infinity Bet es una aplicación descentralizadas para realizar apuestas deportivas de manera trustless, segura y anónima.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Tecnologías utilizadas

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

- [![Next][next.js]][next-url]
- [![React][react.js]][react-url]
- [![Bootstrap][bootstrap.com]][bootstrap-url]
- ![OpenZeppelin-url]
- ![Solidity-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisitos

- npm
  ```sh
  npm install
  ```

### Instalación

1. Se puede conseguir una API key gratuita iniciando sesión en: [https://goerli.etherscan.io/](https://goerli.etherscan.io/)
1. Clonar el repositorio:
   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```
1. Instalar los paquetes de NPM
   ```sh
   npm install
   ```
1. Ingresar la API key en el archivo `config.js`
   ```js
   const ETHERSCAN_API_KEY = "ENTER YOUR API";
   ```
   <p align="right">(<a href="#readme-top">back to top</a>)</p>

### Uso

_NOTA: Nuestra aplicación por el momento sólo funciona en Görli, ya que el oráculo de EnetScore de Chainlink sólo se encuentra disponible para dicha red. Lo que no implica que desconozcamos la desventaja que implica para una aplicación de este tipo los altos costos de transacción en la blockchain de Ethereum_

1. En primer lugar es necesario deployar los contratos del repositorio. Para facilidad del usuario, el script `deploy.js` luego de deployar los contratos, los verifica automáticamente en Etherscan. Gracias a ello, el usuario puede interactuar con el contrato directamente a través de Etherscan.
2. Es importante resaltar que, por la utilización del nodo de Chainlink, además de Eth, es neceario contar con algo de Link para pagar a EnetScores el consumo de la información. En caso de necesitarse un faucet para hacerse de Eth y Link se puede acceder aquí: https://faucets.chain.link/goerli
3. Se debe enviar algo de Link al contrato superBetContract.sol
4. La primera interacción con el contrato nos va a permitir obtener la grilla de partidos correspondiente a la fecha que se especifique. Para ello, llamamos a la función requestSchedule(), que requiere los siguientes parámetros (para más información acerca de los parámetros, visitar la documentación de EnetScores: https://market.link/nodes/Enetscores/integrations):
   "\_specId": 0x6431313062356334623833643432646361323065343130616335333763643934 (que es el correspondiente Görli)
   "\_payment": 100000000000000000 (0.1 LINK)
   "\_market": 0
   "\_leagueId": (las ligas disponibles son las siguientes:
   47: English Premier League
   53: France Ligue
   54: Germany Bundesliga
   55: Italy Serie A
   87: Spain LaLiga
   42: UEFA Champion's League).
   "\_date": en formato epoch UNIX (para convertir el horario GMT a epoch, es posible usar: https://www.epochconverter.com/).
5. Si la transacción es exitosa, el contrato emitirá un evento con dos outputs de tipo bytes32. El segundo de ellos lo usaremos para llamar a la función getGameCreate(), ese output es equivalente al parámetro "\_requestId". El parámetro "\_idx" corresponde a la posición del juego específico que queremos consultar dentro del array de partidos que nos devolvió el request anterior. Esta función de lectura nos devuelve el nombre de los equipos que van a disputar el partido correspondiente, el gameId del partido y la hora exacta de inicio expresada en formato epoch UNIX.
6. Disponiendo de esos datos, podemos llamar ahora a la función createBet() que le permitirá al owner del contrato crear una instancia de apuesta, es decir, va a habilitar a los usuarios para que apuesten a ese partido. Para ello, el owner debe pasar el mismo "\_requestId" que ingresó en la función anterior y el "\_idx" que se desee consultar. Además se deben setear los parámetros "\_homeOdd", "\_awayOdd" y "\_tiedOdd", que corresponden, respectivamente, a las probabilidades que se le asigna al local, al visitante y al empate entre ambos equipos.
7. Si la llamada fue exitosa, cualquier usuario puede ahora invocar a la función setBet(), pasando como parámetros el "\_gameId" (idealmente seteado por default en el front-end), el monto a apostar y la opción que desea elegir (local, visitante, empate).
8. Antes del inicio del partido (cuya hora exacta podemos obtener a partir del epoch que nos devuelve la función getGameCreate()), el owner debe llamar a la función closeBet() para impedir que los usuarios hagan apuestas luego de iniciado el partido. Cuando la propiedad .betOpen == false, no se puede invocar a la función setBet().
9. Luego de finalizado el partido, el owner debe llamar a la función requestSchedule() que permite ingresar como parámetro un array de "\_gameIds". Los parámetros a ingresar son los mismos que los del punto 4, con la diferencia de que en el parámetro "\_market" se debe ingresar el valor "0" y en "\_gameIds" se debe ingresar, entre corchetes y separados por coma, cada uno de los \_gameId cuyo resultado se desee consultar.
10. Realizado el request, es posible ahora llamar nuevamente a la función getGameCreate() ingresando como parámetro el requestId correspondiente que fue generado por el nuevo evento emitido luego de la finalización exitosa del request previo. De esta manera es posible verificar el resultado de los partidos.
11. Finalmente, se puede invocar a la función resolveWinner() pasando como parámetros el "\_gameId" y el "\_requestIdGameResolve" para grabar en la blockchain al ganador del partido.
12. Calculado el ganador, quienes hayan ganado pueden llamar a la función claimRewards() y cobrar el resultado de su apuesta. Para ello debe ingresar como parámetro el "\_gameId" correspondiente.
<!-- ROADMAP -->

## Roadmap

- [x] Add Changelog
- [x] Add back to top links
- [ ] Add Additional Templates w/ Examples
- [ ] Add "components" document to easily copy & paste sections of the readme
- [ ] Multi-language Support
  - [ ] Chinese
  - [ ] Spanish

See the [open issues](https://github.com/othneildrew/Best-README-Template/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Estamos totalmente abiertos a cualquier tipo de feedback y contribución a nuestro proyecto. Si tenes alguna sugerencia que pueda mejorar nuestro proyecto, por favor forkea este repositorio y crea una pull request. También podes dejarnos un comentario creando un Issue con el tag "enhacement".

1. Forkea el proyecto
2. Crea un branch con tu mejora (`git checkout -b feature/AmazingFeature`)
3. Hace un commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Pushea a la branch (`git push origin feature/AmazingFeature`)
5. Abrí una pull request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## Licencia

Distribuido bajo la licencia de MIT. Veáse `LICENSE.txt` para más información.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contacto

El equipo:  [@ElTirri2021](https://twitter.com/ElTirri2021), [@DarthVazquez](https://twitter.com/DarthVazquez)

Link del proyecto: [https://github.com/JIC1816/Infinity-Bet](https://github.com/JIC1816/Infinity-Bet)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!

- [Choose an Open Source License](https://choosealicense.com)
- [GitHub Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet)
- [Malven's Flexbox Cheatsheet](https://flexbox.malven.co/)
- [Malven's Grid Cheatsheet](https://grid.malven.co/)
- [Img Shields](https://shields.io)
- [GitHub Pages](https://pages.github.com)
- [Font Awesome](https://fontawesome.com)
- [React Icons](https://react-icons.github.io/react-icons/search)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: images/screenshot.png
[next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[next-url]: https://nextjs.org/
[react.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://reactjs.org/
[vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[vue-url]: https://vuejs.org/
[angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[angular-url]: https://angular.io/
[svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[svelte-url]: https://svelte.dev/
[laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[laravel-url]: https://laravel.com
[bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[bootstrap-url]: https://getbootstrap.com
[jquery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[jquery-url]: https://jquery.com
[OpenZeppelin-url]: https://img.shields.io/badge/OpenZeppelin-4E5EE4?logo=OpenZeppelin&logoColor=fff&style=for-the-badge
[Solidity-url]: https://img.shields.io/badge/Solidity-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black

```

```
