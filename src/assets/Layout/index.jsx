import { Outlet } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
export default function Layout() {
    return (
        <div>
            <NavigationBar />
            <Outlet />
        </div>
    );
}