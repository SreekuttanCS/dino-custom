import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, type = 'website', name = 'Dino Runner Game' }) {
    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{title}</title>
            <meta name='description' content={description} />

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
}
