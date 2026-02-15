import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import ApiKeyRequiredModal from '@/components/shared/ApiKeyRequiredModal';

export function useApiKeyEnforcer() {
    const { apiKey } = useSettingsStore();
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const checkApiKey = () => {
        if (!apiKey) {
            setShowModal(true);
            return false;
        }
        return true;
    };

    const handleGoToProfile = () => {
        setShowModal(false);
        router.push('/profile');
    };

    const ApiKeyEnforcer = () => (
        <ApiKeyRequiredModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={handleGoToProfile}
        />
    );

    return { checkApiKey, ApiKeyEnforcer };
}
