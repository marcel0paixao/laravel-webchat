import {Inertia, Method} from "@inertiajs/inertia";
import {InertiaFormProps} from "@inertiajs/inertia-react";
import {useEffect, useRef, useState} from "react";

interface VisitOptions {
    method?: Method;
    url: string;
}

const usePrevalidate = (form: InertiaFormProps<any>, {method, url}:VisitOptions) => {

    const [touchedFields, setTouchedFields] = useState(new Set());
    const [needsValidation, setNeedsValidation] = useState(false);

    const prevFormData = useRef(form.data);

    useEffect(() => {
        if (prevFormData.current !== form.data) {
            let changedFields = Object.keys(form.data).filter(field => form.data[field] !== prevFormData.current[field]);

            setTouchedFields(new Set([...changedFields, ...Array.from(touchedFields.values())]));
            setNeedsValidation(true);
        }
        return () => {
            prevFormData.current = form.data;
        };
    }, [form.data]);

    const preValidate = () => {
        if (!needsValidation) return;
        setNeedsValidation(false);

        Inertia.visit(url, {
            method: method,
            data: {
                ...form.data,
                prevalidate: true,
            },
            preserveState: true,
            preserveScroll: true,
            onSuccess:() => form.clearErrors(),
            onError: (errors) => {
                Object.keys(errors)
                    .filter(field => !touchedFields.has(field))
                    .forEach(field => delete errors[field]);

                form.clearErrors();
                form.setError(errors);
            },
        });
    }

    const setAndValidate = (field: any, value: any) => {
        form.setData(field, value);
        preValidate();
    }

    return {preValidate, setAndValidate};

};

export default usePrevalidate;
