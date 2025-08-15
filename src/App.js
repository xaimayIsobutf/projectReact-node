import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/nav_layout';
import HomePage from './views/homepage';
import ProductPage from './components/product';
//import AboutPage from './views/about';
import Category from './components/CategoryPage';
import LoginPage from './views/login';
import BrandsPage from './components/BrandsPage';
import SignupScreen from './views/sign';
import AddProduct from './components/add/addProduct';
import CategoryCreatePage from './components/add/addCategory';
import AddBrand from './components/add/ັ້addBrand';
import EditBrand from './components/edit/editBrand';
import EditCategory from './components/edit/editCategory';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/categories" element={<Category/>} /> 
        <Route path="/brands" element={<BrandsPage/>} /> 
        
      </Route>
      <Route element={<MainLayout hideNav={true} />}>
        <Route path="/products/new" element={<AddProduct/>} />
        <Route path="/categories/new" element={<CategoryCreatePage />} />
        <Route path='/brands/new' element={<AddBrand/>} />
        <Route path="/brands/:id/edit" element={<EditBrand />} />
        <Route path="/categories/:id/edit" element={<EditCategory />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupScreen />} />
    </Routes>
  );
}
