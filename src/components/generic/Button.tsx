import ArrowRight from '../icons/ArrowRight';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    href?: string;
    target?: string;
    rel?: string;
}

export default function Button({ children, href, target, rel, ...buttonProps }: ButtonProps) {
    const className = "group flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors duration-300 cursor-pointer";
    const style = { border: 'none', background: 'none', boxShadow: 'none' };
    
    if (href) {
        // Check if it's an external link
        const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
        
        if (isExternal) {
            return (
                <a 
                    href={href}
                    target={target}
                    rel={rel}
                    className={className}
                    style={style}
                >
                    {children}
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </a>
            );
        }
        
        // Use React Router Link for internal navigation
        return (
            <Link 
                to={href}
                className={className}
                style={style}
            >
                {children}
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
        );
    }
    
    return (
        <button 
            className={className}
            style={style}
            {...buttonProps}
        >
            {children}
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
        </button>
    );
}
