"use client";
import { EntityEditorProvider } from "@/components/context/entityEditorProvider";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import { GetRoleByIdApiAction, RoleData, roleToOutput, UpdateRoleByIdApiAction } from "@/lib/api/admin/role";
import { ApiErrorResponse } from "@/lib/api/networking";
import { runRequest } from "@/lib/api/networking/main";
import { toError } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewRoleLayout({
  params,
  children,
}: Readonly<{ params: Promise<{ id: string }>; children: React.ReactNode }>) {
  const t = useTranslations("common");
  const { showModal } = useModalUpdate();
  const [roleId, setRoleId] = useState<number>();
  const [loading, setLoading] = useState(false);

  // Entity management
  const [entity, setEntity] = useState<RoleData>();

  // Parse params
  useEffect(() => {
    params
      .then((loadedParams) => {
        const newId = parseInt(loadedParams.id);
        if (newId === undefined || isNaN(newId)) {
          notFound();
        }
        setRoleId(newId);
      })
      .catch(() => void 0);
  }, []);

  // Get the entity
  const getEntity = () => {
    if (roleId === undefined) return Promise.reject(new Error("No role specified"));
    return runRequest({ action: new GetRoleByIdApiAction(), pathParams: { id: roleId } });
  };

  // Load entity
  useEffect(() => {
    if (roleId === undefined) return;
    setLoading(true);
    getEntity()
      .then((response) => setEntity(response as RoleData))
      .catch((err) => showModal(t("error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setLoading(false));
  }, [roleId]);

  // Save entity
  const saveRole = (toSave: RoleData) => {
    return new Promise<RoleData>((resolve, reject) => {
      if (!toSave) return;
      setLoading(true);
      const toSend = roleToOutput(toSave);
      runRequest({
        action: new UpdateRoleByIdApiAction(),
        pathParams: {
          id: roleId,
        },
        body: toSend,
      })
        .then(() => {
          getEntity()
            .then((data) => resolve(data))
            .catch((err) => reject(toError(err)));
        })
        .catch((err) => {
          showModal(t("error"), <ErrorMessage error={err as ApiErrorResponse} />);
          reject(toError(err));
        })
        .finally(() => setLoading(false));
    });
  };

  return (
    <div className="page">
      <EntityEditorProvider<RoleData, RoleData> initialViewEntity={entity} loading={loading} onSave={saveRole}>
        {children}
      </EntityEditorProvider>
    </div>
  );
}
