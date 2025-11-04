import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { SimpleButton } from "@/components/ui/SimpleButton";
import { SimpleTitle } from "@/components/ui/SimpleTitle";

interface HeaderProps {
        onClearAll?: () => void;
        hasItems: boolean;
}

export const Header = ({ onClearAll, hasItems }: HeaderProps) => {
        return (
                <header className="border-b border-gray-300 bg-white">
                        <div className="mx-auto max-w-5xl px-4 py-6">
                                <SimpleBlock className="flex flex-col gap-4 border-0 bg-transparent p-0 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-2">
                                                <SimpleTitle as="h1" className="text-2xl">
                                                        Img2Img Converter
                                                </SimpleTitle>
                                                <p className="text-sm text-gray-600">
                                                        Ajoutez vos images, choisissez un format et téléchargez les résultats.
                                                </p>
                                        </div>
                                        {hasItems && onClearAll ? (
                                                <SimpleButton onClick={onClearAll} variant="outline">
                                                        Tout effacer
                                                </SimpleButton>
                                        ) : null}
                                </SimpleBlock>
                        </div>
                </header>
        );
};
