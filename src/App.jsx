// App.jsx
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import NavigationBar from './components/NavigationBar.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import theme from './theme'; // no .jsx needed if it's a .js file
import Footer from './components/Footer.jsx';

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        
        <BrowserRouter>
          <NavigationBar />
          <AppRoutes />
       
        </BrowserRouter>
      </ChakraProvider>
    </Provider>
  );
}

export default App;
