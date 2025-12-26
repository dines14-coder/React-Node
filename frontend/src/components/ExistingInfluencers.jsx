import React from 'react';
import SuperAdminInfluencers from './SuperAdminInfluencers';
import AdminInfluencers from './AdminInfluencers';

function ExistingInfluencers({ user }) {
    const isSuperAdmin = user?.role === 'admin';

    if (isSuperAdmin) {
        return <SuperAdminInfluencers user={user} />;
    } else {
        return <AdminInfluencers user={user} />;
    }
}

export default ExistingInfluencers;
