import { Error } from "./ui/Error";
import { Loading } from "./ui/Loading";

export const RenderSection = ({
    children,
    isLoading,
    error,
    data,
}: {
    children: React.ReactNode;
    isLoading: boolean;
    error: string;
    data?: any;
}) => {
    if (isLoading) return <Loading />;
    if (error) return <Error message={error} />;
    if (!data || (Array.isArray(data) && !data.length)) return null;
    return <>{children}</>;
};
