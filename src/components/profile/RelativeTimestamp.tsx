"use client";

import { useEffect, useState } from 'react';

interface RelativeTimestampProps {
    date?: string | Date;
}

export function RelativeTimestamp({ date }: RelativeTimestampProps) {
    const [mounted, setMounted] = useState(false);
    const [relativeTime, setRelativeTime] = useState('');

    useEffect(() => {
        setMounted(true);
        if (!date) return;

        const formatRelativeTime = () => {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            const now = new Date();
            const diffMs = now.getTime() - dateObj.getTime();
            const diffMins = Math.floor(diffMs / (60 * 1000));
            const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

            if (diffMins < 1) {
                setRelativeTime('Analyzed just now');
                return;
            }
            if (diffMins < 60) {
                setRelativeTime(`Analyzed ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`);
                return;
            }
            if (diffHours < 24) {
                setRelativeTime(`Analyzed ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`);
                return;
            }
            const diffDays = Math.floor(diffHours / 24);
            setRelativeTime(`Analyzed ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`);
        };

        formatRelativeTime();
        const interval = setInterval(formatRelativeTime, 60000);
        return () => clearInterval(interval);
    }, [date]);

    if (!mounted || !date) return null;

    return (
        <span className="text-xs text-text-3 font-mono">
            {relativeTime}
        </span>
    );
}
