"use client";

import { useActionState, useEffect, useState } from "react";
import { type ProjectState, submitProject } from "@/actions/hackathon";
import { PROJECT_LIMITS, type ProjectField } from "@/lib/hackathon";

const initial: ProjectState = { status: "idle" };

export function ProjectForm() {
  const [state, action, pending] = useActionState(submitProject, initial);

  if (state.status === "success") {
    return (
      <div role="status" className="fall-card p-8 md:p-10">
        <p className="mono text-[var(--pumpkin)]">Submitted</p>
        <h3 className="display-wide mt-3 text-[2rem] leading-[1.05]">{state.teamName} is in the pile.</h3>
        <p className="mt-4 text-muted">Your project reached the Ctrl C organizers. Thanks for building with us.</p>
        <p className="mt-6 border-t border-dashed border-line-strong pt-5 text-sm text-muted">
          This account can submit one project. Only an organizer can delete it and allow another submission.
        </p>
      </div>
    );
  }

  return <Fields state={state} action={action} pending={pending} />;
}

function Fields({
  state,
  action,
  pending,
}: {
  state: ProjectState;
  action: (formData: FormData) => void;
  pending: boolean;
}) {
  const values = state.status === "error" ? state.values : undefined;
  const errors = state.status === "error" ? state.errors : undefined;

  const [teamName, setTeamName] = useState(values?.teamName ?? "");
  const [description, setDescription] = useState(values?.description ?? "");
  const [teammates, setTeammates] = useState<string[]>(values?.teammates.length ? values.teammates : [""]);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  // The browser clears file inputs after every submit, so drop the stale preview with it.
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    setSeenState(state);
    setPreview(null);
  }

  const fieldProps = (name: ProjectField) =>
    errors?.[name] ? { "aria-invalid": true as const, "aria-describedby": `project-${name}-error` } : {};
  const errorText = (name: ProjectField) =>
    errors?.[name] ? (
      <p id={`project-${name}-error`} className="mt-1.5 text-sm text-[var(--maroon)]">
        {errors[name]}
      </p>
    ) : null;

  const names = teammates.map((n) => n.trim()).filter(Boolean);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
      <form action={action} noValidate className="grid gap-6" aria-label="Submit your project">
        <div>
          <label htmlFor="project-image" className="mono text-muted">
            Cover image
          </label>
          <input
            id="project-image"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="fall-file field mt-2"
            required
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
            {...fieldProps("image")}
          />
          <p className="mt-1.5 text-sm text-faint">Shown at the top of your project. PNG, JPG, WebP or GIF, up to 5 MB.</p>
          {errorText("image")}
        </div>

        <div>
          <label htmlFor="project-teamName" className="mono text-muted">
            Team name
          </label>
          <input
            id="project-teamName"
            name="teamName"
            className="field mt-2"
            required
            maxLength={PROJECT_LIMITS.teamName}
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            {...fieldProps("teamName")}
          />
          {errorText("teamName")}
        </div>

        <fieldset {...fieldProps("teammates")}>
          <legend className="mono text-muted">Teammates</legend>
          <ul className="mt-2 grid gap-2">
            {teammates.map((name, i) => (
              <li key={i} className="flex gap-2">
                <label htmlFor={`project-teammate-${i}`} className="sr-only">
                  Teammate {i + 1}
                </label>
                <input
                  id={`project-teammate-${i}`}
                  name="teammates"
                  className="field"
                  placeholder={`Teammate ${i + 1}`}
                  autoComplete="off"
                  maxLength={PROJECT_LIMITS.memberName}
                  value={name}
                  onChange={(e) => setTeammates((list) => list.map((n, j) => (j === i ? e.target.value : n)))}
                />
                {teammates.length > 1 && (
                  <button
                    type="button"
                    className="fall-ghost shrink-0"
                    aria-label={`Remove teammate ${i + 1}`}
                    onClick={() => setTeammates((list) => list.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          {teammates.length < PROJECT_LIMITS.maxMembers && (
            <button type="button" className="fall-ghost mt-2 px-3" onClick={() => setTeammates((list) => [...list, ""])}>
              + Add teammate
            </button>
          )}
          {errorText("teammates")}
        </fieldset>

        <div>
          <label htmlFor="project-description" className="mono text-muted">
            Description
          </label>
          <textarea
            id="project-description"
            name="description"
            rows={5}
            className="field mt-2 resize-y"
            required
            maxLength={PROJECT_LIMITS.description}
            placeholder="What did you make, how does it work, and what are you proud of?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            {...fieldProps("description")}
          />
          {errorText("description")}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="project-githubUrl" className="mono text-muted">
              GitHub repo
            </label>
            <input
              id="project-githubUrl"
              name="githubUrl"
              type="url"
              inputMode="url"
              className="field mt-2"
              placeholder="https://github.com/team/project"
              required
              maxLength={PROJECT_LIMITS.url}
              defaultValue={values?.githubUrl}
              {...fieldProps("githubUrl")}
            />
            {errorText("githubUrl")}
          </div>
          <div>
            <label htmlFor="project-demoUrl" className="mono text-muted">
              Demo link
            </label>
            <input
              id="project-demoUrl"
              name="demoUrl"
              type="url"
              inputMode="url"
              className="field mt-2"
              placeholder="https://your-project.example.com"
              required
              maxLength={PROJECT_LIMITS.url}
              defaultValue={values?.demoUrl}
              {...fieldProps("demoUrl")}
            />
            {errorText("demoUrl")}
          </div>
        </div>

        <div>
          <label htmlFor="project-aiDeclaration" className="mono text-muted">
            AI Declaration
          </label>
          <p className="mt-1 text-sm text-faint">
            Where did you use AI? List the tools and what they helped with. If you didn’t use any, write “No AI used”.
          </p>
          <textarea
            id="project-aiDeclaration"
            name="aiDeclaration"
            rows={4}
            className="field mt-2 resize-y"
            required
            maxLength={PROJECT_LIMITS.aiDeclaration}
            defaultValue={values?.aiDeclaration}
            {...fieldProps("aiDeclaration")}
          />
          {errorText("aiDeclaration")}
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="project-website">Leave this empty</label>
          <input id="project-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {state.status === "error" && state.message && (
          <p role="alert" className="text-sm text-[var(--maroon)]">
            {state.message}
          </p>
        )}
        {errors && (
          <p role="alert" className="text-sm text-[var(--maroon)]">
            Please fix the highlighted fields and choose your image again.
          </p>
        )}

        <button type="submit" className="key key--primary w-full" disabled={pending}>
          <span>{pending ? "Submitting…" : "Submit project"}</span>
          <span className="key__hint" aria-hidden="true">
            ↵
          </span>
        </button>
      </form>

      <aside aria-label="Preview" className="lg:sticky lg:top-8 lg:self-start">
        <p className="mono text-muted">Preview</p>
        <article className="fall-card mt-2 overflow-hidden">
          <div className="fall-cover aspect-[16/10]">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <span className="mono">Your image goes here</span>
            )}
          </div>
          <div className="p-6">
            <h3 className="display-wide text-[1.6rem] leading-[1.05] break-words">{teamName.trim() || "Team name"}</h3>
            <p className="mono mt-2 text-faint">{names.length ? names.join(" · ") : "Teammates"}</p>
            <p className="mt-4 line-clamp-5 whitespace-pre-wrap break-words text-muted">
              {description.trim() || "Your description will show up here."}
            </p>
          </div>
        </article>
      </aside>
    </div>
  );
}
