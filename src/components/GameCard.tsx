import Image from 'next/image';
import Link from 'next/link';

interface GameCardProps {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
}

const GameCard = ({ id, name, description, imageUrl }: GameCardProps) => {
    return (
        <Link href={`/game/${id}`}>
            <div className="bg-[#0a192f]/60 backdrop-blur-md rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl border border-[#64ffda]/20">
                <div className="relative h-48 w-full">
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover"
                        unoptimized={imageUrl.endsWith('.gif')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] to-transparent opacity-60" />
                </div>
                <div className="p-4">
                    <h3 className="text-xl font-bold text-[#64ffda] mb-2">{name}</h3>
                    <p className="text-gray-300 text-sm">{description}</p>
                </div>
            </div>
        </Link>
    );
};

export default GameCard; 