"""Runs the Python in the course's questions and checks it against the stated answers.

  output questions      the code must print exactly the answer
  choice with run       the code must print exactly the right option
  number with check     the expression must evaluate to the answer
  write                 the solution must pass the tests, and the starter must not
  bug                   the code must still parse with the fix put in

Usage: npx vite-node scripts/dump.ts [module] && python scripts/verify.py [module]
Code that needs a library that is not installed here is listed as not checked.
"""
import json, math, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
only = sys.argv[1] if len(sys.argv) > 1 else ''
rows = json.load(open(os.path.join(HERE, f".questions{'-' + only if only else ''}.json"), encoding='utf-8'))

def tidy(text):
    return '\n'.join(line.strip() for line in text.replace('\r', '').split('\n')).strip()

def run(code):
    """Returns (ok, stdout, last line of stderr)."""
    with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False, encoding='utf-8') as f:
        f.write(code)
        path = f.name
    try:
        p = subprocess.run([sys.executable, path], capture_output=True, text=True, timeout=60, encoding='utf-8')
        err = p.stderr.strip().split('\n')[-1] if p.stderr.strip() else ''
        return p.returncode == 0, p.stdout, err
    except subprocess.TimeoutExpired:
        return False, '', 'timed out'
    finally:
        os.unlink(path)

bad, skipped, checked = [], [], 0
def missing(err):
    return err.startswith('ModuleNotFoundError') or err.startswith('ImportError')

for r in rows:
    qid, kind = r['id'], r['kind']
    if kind == 'output' or (kind == 'choice' and r.get('run')):
        want = r['answer'] if kind == 'output' else r['options'][r['answer']]
        ok, out, err = run(r['code'])
        if not ok and missing(err):
            skipped.append(f'{qid}: {err}')
        elif not ok:
            bad.append(f'{qid}: the code fails: {err}')
        elif tidy(out) != tidy(want):
            bad.append(f'{qid}: prints {tidy(out)!r}, answer says {tidy(want)!r}')
        else:
            checked += 1
    elif kind == 'number' and r.get('check'):
        ok, out, err = run(f"import math\nimport numpy as np\nprint(float({r['check']}))")
        tol = r.get('tol') or max(0.01, abs(r['answer']) * 0.01)
        if not ok:
            bad.append(f'{qid}: the check fails: {err}')
        elif abs(float(out) - r['answer']) > tol:
            bad.append(f"{qid}: check gives {out.strip()}, answer says {r['answer']}")
        else:
            checked += 1
    elif kind == 'write':
        ok, out, err = run(r['solution'] + '\n\n' + r['tests'] + '\n')
        if not ok and missing(err):
            skipped.append(f'{qid}: {err}')
        elif not ok:
            bad.append(f'{qid}: the solution fails its own tests: {err}')
        else:
            ok2, _, _ = run(r['starter'] + '\n\n' + r['tests'] + '\n')
            if ok2:
                bad.append(f'{qid}: the starter already passes the tests')
            elif 'numpy' in r['solution'] and not r.get('numpy'):
                bad.append(f'{qid}: uses numpy but is not marked numpy: true')
            else:
                checked += 1
    elif kind == 'bug':
        lines = r['code'].split('\n')
        if not (1 <= r['line'] <= len(lines)) or not lines[r['line'] - 1].strip():
            bad.append(f'{qid}: line {r["line"]} is not a line of code')
            continue
        if lines[r['line'] - 1].strip() == r['fix'].strip():
            bad.append(f'{qid}: the fix is the same as the buggy line')
            continue
        fixed = lines[:]
        fixed[r['line'] - 1] = r['fix']
        try:
            compile(r['code'], qid, 'exec')
        except SyntaxError:
            continue  # not Python (a config file, SQL, pseudocode): nothing to parse
        try:
            compile('\n'.join(fixed), qid, 'exec')
            checked += 1
        except SyntaxError as e:
            bad.append(f'{qid}: with the fix put in, the code no longer parses: {e.msg} (is the indentation of the fix right?)')

print(f'{checked} checked, {len(skipped)} not checked (library missing), {len(bad)} wrong')
for s in skipped:
    print('  not checked:', s)
for b in bad:
    print('  WRONG:', b)
sys.exit(1 if bad else 0)
