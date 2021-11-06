

export function ywSpinnerView({ classes, size, duration }: { classes?: string, size: string, duration: number }) {
    let logoUrl = '/api/assets-gateway/raw/package/QHlvdXdvbC9mbHV4LXlvdXdvbC1lc3NlbnRpYWxz/latest/assets/images/logo_YouWol_white.png'

    return {
        class: classes || "",
        style: {
            width: size,
            height: size,
        },
        children: [
            {
                tag: 'img',
                class: `my-auto image`,
                src: logoUrl,
                style: {
                    position: 'absolute',
                    width: size,
                    height: size,
                    animation: `spin ${duration}s linear infinite`,
                }
            }
        ]
    }
}
