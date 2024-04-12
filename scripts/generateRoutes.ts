// generateRoutes.ts
import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'

const pagesDirectory = path.join(import.meta.dirname, '../src/pages')
const routesFile = path.join(import.meta.dirname, '../src/routes.tsx')

/**
 * Determines if the current module is being run as a script.
 *
 * This function checks if the module's URL matches the second command-line argument,
 * which indicates that the module is being executed directly by Node.js as a script,
 * rather than being imported or required by another module.
 *
 * @returns {boolean} True if the module is running as a script, false otherwise.
 */
function isRunningAsScript(): boolean {
  const moduleURL = new URL(import.meta.url)
  return process.argv[1] === url.fileURLToPath(moduleURL)
}

/**
 * Generates a route path from a given file name.
 *
 * This function takes the name of a file and processes it to generate a route path for use in a web application.
 * It removes the '.tsx' extension and any trailing 'index' from the file name. If the resulting name is 'home',
 * it returns '/' to represent the root path. Otherwise, it prefixes the name with '/' to form the route path.
 *
 * @param {string} fileName - The name of the file to generate a route path from.
 * @returns {string} The generated route path. Returns '/' for 'home', or the file name prefixed with '/'.
 */
function generateRoutePath(fileName: string): string {
  const name = fileName.replace(/\.tsx$/, '').replace(/index$/, '')
  return name === 'home' ? '/' : `/${name}`
}

/**
 * Transforms a file name into a PascalCase component name.
 *
 * This function takes a file name, splits it by hyphens (-) or periods (.), capitalizes the first letter of each segment,
 * and then concatenates them back together. This is useful for converting file names into valid React component names
 * following the PascalCase naming convention.
 *
 * @param {string} fileName - The name of the file to transform into a component name.
 * @returns {string} The transformed PascalCase component name.
 */
function parseComponentName(fileName: string): string {
  return fileName
    .split(/[-\.]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

function getRoutesFileContent(imports: string[], routes: string[]): string {
  return `${imports.join('\n')}
import { Routes, Route, BrowserRouter } from 'react-router-dom'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        ${routes.join('\n        ')}
      </Routes>
    </BrowserRouter>
  )
}
`
}

/**
 * Generates and writes the routes configuration for a React application based on the file structure within the `src/pages` directory.
 *
 * This function dynamically reads the `src/pages` directory to find all `.tsx` files and directories containing an `index.tsx` file.
 * For each of these, it generates import statements and route configurations using the `react-router-dom` library. The generated
 * code is then written to a `Routes.tsx` file in the `src` directory, which exports a `AppRoutes` component. This component
 * can be used to configure routing in a React application.
 */
export async function generateRoutes(): Promise<void> {
  let imports: string[] = [] // Accumulates import statements for the page components.
  let routes: string[] = [] // Accumulates <Route> configurations for each page.

  // Read the pages directory and process each file/directory found.
  fs.readdirSync(pagesDirectory).forEach((file) => {
    const filePath = path.join(pagesDirectory, file) // Full path to the file/directory.
    const stat = fs.statSync(filePath) // File system stats for the file/directory.

    if (stat.isDirectory()) {
      // If the file is a directory, check for an index.tsx file.
      const indexFile = path.join(filePath, 'index.tsx')
      if (fs.existsSync(indexFile)) {
        // Generate route path and update imports and routes strings.
        const routePath = generateRoutePath(file)
        imports.push(`import ${parseComponentName(file)} from './pages/${file}'`)
        routes.push(`<Route path="${routePath}" element={<${parseComponentName(file)} />} />`)
      }
    } else if (file.endsWith('.tsx')) {
      // If the file is a .tsx file, generate route path and update imports and routes strings.
      const routePath = generateRoutePath(file)
      const componentName = file.replace(/\.tsx$/, '')
      imports.push(`import ${parseComponentName(componentName)} from './pages/${componentName}'`)
      routes.push(`<Route path="${routePath}" element={<${parseComponentName(componentName)} />} />`)
    }
  })

  // Combine the generated imports and routes with the necessary React Router imports to form the complete file content.
  const content = getRoutesFileContent(imports, routes)

  // Write the generated content to the Routes.tsx file.
  fs.writeFileSync(routesFile, content)
}

if (isRunningAsScript()) {
  await generateRoutes()
}
