// theme.js
import { extendTheme } from '@chakra-ui/react';

const customTheme = extendTheme({
  colors: {
    primary: {
      100: "#E3FDFD",
      200: "#CBF1F5",
      300: "#A6E3E9",
      400: "#71C9CE",
      500: "#48BFE3"
    }
  }
});

export default customTheme;
