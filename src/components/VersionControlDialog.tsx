/**
 * Version-control panel — WS3 Phase 7 slice E.
 *
 * READ-ONLY by design (command contract §3, §5): designate a repository, see
 * the branch and working-tree status, and read the diff and history of the
 * dashboard file currently open. There is no commit action in this slice.
 *
 * ⚠ MOUNT THIS ONLY WHILE OPEN — `{open && <VersionControlDialog … />}` in the
 * parent. `destroyOnHidden` destroys the modal's DOM but NOT this component, so
 * a component rendered unconditionally keeps its state (and any
 * `Form.useForm()` instance) across closes and shows stale values on re-open.
 * See [PATTERN] antd Modal + Form.useForm instance lifetime.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Empty, Modal, Space, Spin, Table, Tabs, Tag, Typography } from 'antd';

const { Text, Paragraph } = Typography;

interface VersionControlDialogProps {
  open: boolean;
  onClose: () => void;
  /** Absolute path of the dashboard file currently open, if any. */
  currentFilePath: string | null;
}

interface StatusEntry {
  code: string;
  path: string;
  originalPath?: string;
}

interface Commit {
  hash: string;
  author: string;
  date: string;
  subject: string;
}

/** Porcelain-v1 two-character codes, rendered as something a human can read. */
const describeStatusCode = (code: string): { label: string; colour: string } => {
  if (code === '??') return { label: 'Untracked', colour: 'default' };
  if (code.includes('R')) return { label: 'Renamed', colour: 'purple' };
  if (code.includes('C')) return { label: 'Copied', colour: 'purple' };
  if (code.includes('D')) return { label: 'Deleted', colour: 'red' };
  if (code.includes('A')) return { label: 'Added', colour: 'green' };
  if (code.includes('M')) return { label: 'Modified', colour: 'orange' };
  return { label: code.trim() || 'Changed', colour: 'default' };
};

export const VersionControlDialog: React.FC<VersionControlDialogProps> = ({
  open,
  onClose,
  currentFilePath,
}) => {
  const [repoRoot, setRepoRoot] = useState<string | null>(null);
  const [branch, setBranch] = useState<string | null>(null);
  const [detached, setDetached] = useState(false);
  const [entries, setEntries] = useState<StatusEntry[]>([]);
  const [diff, setDiff] = useState<string | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gitUnavailable, setGitUnavailable] = useState(false);

  const refresh = useCallback(
    async (root: string) => {
      setLoading(true);
      setError(null);
      try {
        const branchResult = await window.electronAPI.vcsBranch(root);
        if (!branchResult.success) {
          // git absent is a first-class state, not an error dialog.
          if (branchResult.error === 'GIT_NOT_AVAILABLE') {
            setGitUnavailable(true);
            return;
          }
          setError(branchResult.error ?? 'Could not read the current branch');
          return;
        }
        setBranch(branchResult.branch ?? null);
        setDetached(Boolean(branchResult.detached));

        const statusResult = await window.electronAPI.vcsStatus(root);
        if (!statusResult.success) {
          setError(statusResult.error ?? 'Could not read the working tree status');
          return;
        }
        setEntries(statusResult.entries ?? []);

        // The headline flow: "what have I changed since my last commit?" for the
        // dashboard the user actually has open.
        if (currentFilePath) {
          const diffResult = await window.electronAPI.vcsDiffFile(root, currentFilePath);
          setDiff(diffResult.success ? (diffResult.diff ?? '') : null);

          const logResult = await window.electronAPI.vcsLog(root, currentFilePath, 20);
          setCommits(logResult.success ? (logResult.commits ?? []) : []);
        } else {
          setDiff(null);
          setCommits([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [currentFilePath],
  );

  // Load the designated repository when the dialog opens. Because the parent
  // mounts this component only while open, this effect IS the per-open reset —
  // every open starts from fresh state.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      const listed = await window.electronAPI.vcsListRepoRoots();
      if (cancelled) return;
      const root = listed.roots?.[0] ?? null;
      setRepoRoot(root);
      if (root) await refresh(root);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, refresh]);

  const handleDesignate = async () => {
    setError(null);
    const result = await window.electronAPI.vcsDesignateRepoRoot();
    if (result.canceled) return;
    if (!result.success || !result.root) {
      setError(result.error ?? 'Could not use that directory');
      return;
    }
    setRepoRoot(result.root);
    await refresh(result.root);
  };

  const handleForget = async () => {
    await window.electronAPI.vcsClearRepoRoots();
    setRepoRoot(null);
    setBranch(null);
    setEntries([]);
    setDiff(null);
    setCommits([]);
  };

  const body = () => {
    if (gitUnavailable) {
      return (
        <Alert
          type="info"
          showIcon
          title="git is not available"
          description="Version control features need git on your PATH. Everything else in HAVDM works without it."
          data-testid="vcs-git-unavailable"
        />
      );
    }

    if (!repoRoot) {
      return (
        <Empty
          description={
            <Space direction="vertical" align="center">
              <Text>No repository selected.</Text>
              <Text type="secondary">
                Many Home Assistant users keep their whole config directory in git. Point HAVDM at
                it to see what has changed.
              </Text>
            </Space>
          }
        >
          <Button type="primary" onClick={handleDesignate} data-testid="vcs-choose-repo">
            Choose repository...
          </Button>
        </Empty>
      );
    }

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space wrap>
          <Text strong>Repository:</Text>
          <Text code data-testid="vcs-repo-root">
            {repoRoot}
          </Text>
          {branch && (
            <Tag color={detached ? 'orange' : 'blue'} data-testid="vcs-branch">
              {detached ? 'detached HEAD' : branch}
            </Tag>
          )}
          <Button size="small" onClick={() => refresh(repoRoot)} data-testid="vcs-refresh">
            Refresh
          </Button>
          <Button size="small" onClick={handleForget} data-testid="vcs-forget-repo">
            Forget
          </Button>
        </Space>

        {error && <Alert type="error" showIcon title={error} data-testid="vcs-error" />}

        <Tabs
          defaultActiveKey="status"
          items={[
            {
              key: 'status',
              label: `Changes (${entries.length})`,
              children: (
                <Table<StatusEntry>
                  size="small"
                  rowKey={(row) => `${row.code}:${row.path}`}
                  dataSource={entries}
                  pagination={false}
                  scroll={{ y: 260 }}
                  data-testid="vcs-status-table"
                  locale={{ emptyText: 'Working tree clean' }}
                  columns={[
                    {
                      title: 'State',
                      dataIndex: 'code',
                      width: 110,
                      render: (code: string) => {
                        const { label, colour } = describeStatusCode(code);
                        return <Tag color={colour}>{label}</Tag>;
                      },
                    },
                    {
                      title: 'File',
                      dataIndex: 'path',
                      render: (value: string, row) => (
                        <Text>
                          {value}
                          {row.originalPath && (
                            <Text type="secondary"> (was {row.originalPath})</Text>
                          )}
                        </Text>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              key: 'diff',
              label: 'Current file diff',
              children: !currentFilePath ? (
                <Empty description="Open a dashboard file to see its diff" />
              ) : diff === null ? (
                <Empty description="This file is not tracked in the selected repository" />
              ) : diff.trim().length === 0 ? (
                <Empty description="No uncommitted changes to this file" />
              ) : (
                <pre
                  data-testid="vcs-diff"
                  style={{
                    maxHeight: 320,
                    overflow: 'auto',
                    fontSize: 12,
                    margin: 0,
                    whiteSpace: 'pre',
                  }}
                >
                  {diff}
                </pre>
              ),
            },
            {
              key: 'history',
              label: `History (${commits.length})`,
              children: (
                <Table<Commit>
                  size="small"
                  rowKey="hash"
                  dataSource={commits}
                  pagination={false}
                  scroll={{ y: 260 }}
                  data-testid="vcs-history-table"
                  locale={{ emptyText: 'No history for this file' }}
                  columns={[
                    {
                      title: 'Commit',
                      dataIndex: 'hash',
                      width: 90,
                      render: (hash: string) => <Text code>{hash.slice(0, 7)}</Text>,
                    },
                    { title: 'Subject', dataIndex: 'subject' },
                    { title: 'Author', dataIndex: 'author', width: 140 },
                    {
                      title: 'When',
                      dataIndex: 'date',
                      width: 170,
                      render: (date: string) => <Text type="secondary">{date}</Text>,
                    },
                  ]}
                />
              ),
            },
          ]}
        />

        <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 12 }}>
          Read-only. HAVDM never writes to your repository — no commit, no push, no checkout.
        </Paragraph>
      </Space>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Version Control"
      width={820}
      destroyOnHidden
      footer={[
        <Button key="close" onClick={onClose} data-testid="vcs-close">
          Close
        </Button>,
      ]}
      data-testid="version-control-dialog"
      rootClassName="version-control-dialog"
    >
      {/* ⚠ antd puts unknown props like `data-testid` on `.ant-modal-root`, which
          is itself `hidden` — so tests must assert against content INSIDE the
          modal, not the root. This wrapper is that anchor. */}
      <div data-testid="version-control-panel">
        <Spin spinning={loading}>{body()}</Spin>
      </div>
    </Modal>
  );
};
