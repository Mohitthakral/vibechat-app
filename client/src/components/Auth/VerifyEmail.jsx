import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      await authAPI.verifyEmail(token);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
      >
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">Verifying Email</h2>
            <p className="text-gray-600 mt-2">Please wait...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
            <p className="text-gray-600 mt-2">
              Your email has been successfully verified.
              Redirecting to login...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
            <p className="text-gray-600 mt-2">
              The verification link is invalid or has expired.
            </p>
            <Link to="/login" className="btn-primary mt-6 inline-block">
              Go to Login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}