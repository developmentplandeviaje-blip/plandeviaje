import {
    WifiHighIcon,
    SwimmingPoolIcon,
    SparkleIcon,
    BarbellIcon,
    ForkKnifeIcon,
    WineIcon,
    ClockIcon,
    FanIcon,
    TennisBallIcon,
    CarIcon,
    SunIcon,
    BabyIcon,
    BusIcon,
    WashingMachineIcon,
    VaultIcon,
    TelevisionIcon,
    PhoneCallIcon,
    ElevatorIcon,
    CheckCircleIcon
} from '@phosphor-icons/react';

/**
 * Maps a feature icon key (string stored in DB) to a Phosphor Icons component.
 * Usage: featureIcons['wifi'] => <WifiHigh />
 *
 * Available keys:
 * wifi, pool, spa, gym, restaurant, bar, clock, ac, tennis,
 * parking, beach, kids, shuttle, laundry, safe, tv, phone, elevator
 */
const featureIcons = {
    wifi: <WifiHighIcon />,
    pool: <SwimmingPoolIcon />,
    spa: <SparkleIcon />,
    gym: <BarbellIcon />,
    restaurant: <ForkKnifeIcon />,
    bar: <WineIcon />,
    clock: <ClockIcon />,
    ac: <FanIcon />,
    tennis: <TennisBallIcon />,
    parking: <CarIcon />,
    beach: <SunIcon />,
    kids: <BabyIcon />,
    shuttle: <BusIcon />,
    laundry: <WashingMachineIcon />,
    safe: <VaultIcon />,
    tv: <TelevisionIcon />,
    phone: <PhoneCallIcon />,
    elevator: <ElevatorIcon />,
};

/**
 * Returns the SVG icon for a given key, or a default circle icon if not found.
 * @param {string} key
 * @returns {JSX.Element}
 */
export const getFeatureIcon = (key) =>
    featureIcons[key] ?? <CheckCircleIcon />;

export default featureIcons;
