import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="container clamp d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="text-center">
                <h1 className="mb-5"><span style={{ color: '#1976d2' }}>doc</span><span className="text-danger">doc</span></h1>
                <img src="/images/icons/favicon.svg" alt="favicon" className="img-fluid mb-5" />
                <div className="d-flex justify-content-center mt-3">
                    <input type="text" className="form-control" placeholder="Enter documentation URL" style={{ backgroundColor: '#E9EBEE' }} />
                    <button className="btn btn-danger ml-2 text-nowrap" title="Connect GitHub">Connect GitHub</button>
                </div>
            </div>
        </div>
    );
};

export default Home;