'use client';

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

interface TourGuideProps {
    startOnMount?: boolean;
}

export function TourGuide({ startOnMount = false }: TourGuideProps) {
    const t = useTranslations('Tour');

    const tourDriver = driver({
        showProgress: true,
        steps: [
            {
                element: '#new-story-btn',
                popover: {
                    title: t('step1_title'),
                    description: t('step1_desc'),
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#projects-list',
                popover: {
                    title: t('step2_title'),
                    description: t('step2_desc'),
                    side: "top",
                    align: 'start'
                }
            },
            {
                element: '#profile-menu',
                popover: {
                    title: t('step3_title'),
                    description: t('step3_desc'),
                    side: "left",
                    align: 'center'
                }
            }
        ],
        onDestroyStarted: () => {
            if (!tourDriver.hasNextStep() || confirm(t('confirm_exit'))) {
                tourDriver.destroy();
            }
        },
    });

    useEffect(() => {
        if (startOnMount) {
            // Check if user has seen tour before (optional)
            const hasSeen = localStorage.getItem('hasSeenTour');
            if (!hasSeen) {
                setTimeout(() => {
                    tourDriver.drive();
                    localStorage.setItem('hasSeenTour', 'true');
                }, 1000); // Delay for UI load
            }
        }
    }, [startOnMount, tourDriver]);

    return null; // Logic-only component
}
