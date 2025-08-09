import { useToast } from "@/components/ui/use-toast";

export const useToastNotification = () => {
    const { toast } = useToast();

    const notify = (title: string, description: string) => {
        toast({
            title,
            description,
        });
    };

    return notify;
};
