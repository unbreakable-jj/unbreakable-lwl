import { Navigate } from 'react-router-dom';

// Redirect to Strength calculator as the default page
const Index = () => {
  return <Navigate to="/strength" replace />;
};

export default Index;
