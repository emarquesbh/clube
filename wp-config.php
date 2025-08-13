<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'ama' );

/** Database username */
define( 'DB_USER', 'eduardo' );

/** Database password */
define( 'DB_PASSWORD', 'bahia504++' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '>bO)84f9>1.jr#Rvn0-U.M8u|J=M|yKk)NZKsgY`[O`d:Slz+E-Pi2=B:vmpM^sf' );
define( 'SECURE_AUTH_KEY',  '-d.F+c/2|xvep|IBi&i Ib{#Gu&M.o]>+k0k+>c{weki@X+Y{T~rv0 osu_GVsTi' );
define( 'LOGGED_IN_KEY',    '=, JSA/<n2RVEU=*?crK:;MsuPn)z#c|*66$&R,?32fB{zk]GVH~Z]?x#7pg2aZ<' );
define( 'NONCE_KEY',        'XlfKYkK6ExF 1OGaI|&}5?jHUf9n6W]LH,(Ppf%%u#4U _!<xj~R[%wHD3l o)~x' );
define( 'AUTH_SALT',        't>13}Nbb}ys;sv=m,b3Nq{+lCrh47c`$LvlfCnCy:PM731;f`+u[,h0!c``I-|DZ' );
define( 'SECURE_AUTH_SALT', '<i1>_=C(I.i+ZJ,oiR^7.*z^[;f[V<g&,H#]_j9cU}?%Pd<4o c?3$rOKK~RM`bE' );
define( 'LOGGED_IN_SALT',   'AA%tOE&wFEH;AF(6K/[@J[0HGboMAZj-%t6Uj%,0l|HaFo5KQQV{s7fsMoNW@_h*' );
define( 'NONCE_SALT',       '@x^~r*ZBrt?_Z[ AD[vHJlm.NZa$#J{B5t[EyKj+5AbM]?e|G0{.D.9D=yV_[WE}' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
