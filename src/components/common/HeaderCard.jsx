
export const HeaderCard = ({ title, subtitle, className, icon, titleTag: TitleTag = "h3", titleClassName, children }) => {
    return (
        <div className={className}>
            <TitleTag className={titleClassName}>
                {icon}
                {title}
            </TitleTag>
            <p>{subtitle}</p>
            {children}
        </div>
    );
};
