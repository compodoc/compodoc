import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * C4DiagramComponent description
 *
 * See {@link https://mermaid-js.github.io/mermaid/#/c4c}
 *
 * ```mermaid
 * C4Context
 *       title System Context diagram for Internet Banking System
 *       Enterprise_Boundary(b0, "BankBoundary0") {
 *         Person(customerA, "Banking Customer A", "A customer of the bank, with personal bank accounts.")
 *         Person(customerB, "Banking Customer B")      
 *         Person_Ext(customerC, "Banking Customer C", "desc")            
 * 
 *         Person(customerD, "Banking Customer D", "A customer of the bank, <br/> with personal bank accounts.")
 * 
 *         System(SystemAA, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")  
 * 
 *         Enterprise_Boundary(b1, "BankBoundary") {
 *          
 *           SystemDb_Ext(SystemE, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")      
 * 
 *           System_Boundary(b2, "BankBoundary2") {  
 *             System(SystemA, "Banking System A")  
 *             System(SystemB, "Banking System B", "A system of the bank, with personal bank accounts. next line.")        
 *           } 
 * 
 *           System_Ext(SystemC, "E-mail system", "The internal Microsoft Exchange e-mail system.") 
 *           SystemDb(SystemD, "Banking System D Database", "A system of the bank, with personal bank accounts.") 
 * 
 *           Boundary(b3, "BankBoundary3", "boundary") {  
 *             SystemQueue(SystemF, "Banking System F Queue", "A system of the bank.")        
 *             SystemQueue_Ext(SystemG, "Banking System G Queue", "A system of the bank, with personal bank accounts.") 
 *           }
 *         }
 *       }
 *       
 *       BiRel(customerA, SystemAA, "Uses")
 *       BiRel(SystemAA, SystemE, "Uses")
 *       Rel(SystemAA, SystemC, "Sends e-mails", "SMTP")
 *       Rel(SystemC, customerA, "Sends e-mails to")
 * 
 *       UpdateElementStyle(customerA, $fontColor="red", $bgColor="grey", $borderColor="red")
 *       UpdateRelStyle(customerA, SystemAA, $textColor="blue", $lineColor="blue", $offsetX="5")
 *       UpdateRelStyle(SystemAA, SystemE, $textColor="blue", $lineColor="blue", $offsetY="-10")
 *       UpdateRelStyle(SystemAA, SystemC, $textColor="blue", $lineColor="blue", $offsetY="-40", $offsetX="-50")
 *       UpdateRelStyle(SystemC, customerA, $textColor="red", $lineColor="red", $offsetX="-50", $offsetY="20")
 *       
 *       UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
 * ```
 *
 */
@Component({
    selector: 'app-c4-diagram',
    styles: [],
    template: `
        <div class="host"></div>
    `
})
export class C4DiagramComponent {
	/**
	*
	 * ```mermaid
	 *     C4Component
	 *     title Component diagram for Internet Banking System - API Application
	 * 
	 *     Container(spa, "Single Page Application", "javascript and angular", "Provides all the internet banking functionality to customers via their web browser.")
	 *     Container(ma, "Mobile App", "Xamarin", "Provides a limited subset ot the internet banking functionality to customers via their mobile mobile device.")
	 *     ContainerDb(db, "Database", "Relational Database Schema", "Stores user registration information, hashed authentication credentials, access logs, etc.")
	 *     System_Ext(mbs, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")
	 * 
	 *     Container_Boundary(api, "API Application") {
	 *         Component(sign, "Sign In Controller", "MVC Rest Controlle", "Allows users to sign in to the internet banking system")
	 *         Component(accounts, "Accounts Summary Controller", "MVC Rest Controller", "Provides customers with a summary of their bank accounts")
	 *         Component(security, "Security Component", "Spring Bean", "Provides functionality related to singing in, changing passwords, etc.")
	 *         Component(mbsfacade, "Mainframe Banking System Facade", "Spring Bean", "A facade onto the mainframe banking system.")
	 * 
	 *         Rel(sign, security, "Uses")
	 *         Rel(accounts, mbsfacade, "Uses")
	 *         Rel(security, db, "Read & write to", "JDBC")
	 *         Rel(mbsfacade, mbs, "Uses", "XML/HTTPS")
	 *     }
	 * 
	 *     Rel_Back(spa, sign, "Uses", "JSON/HTTPS")
	 *     Rel(spa, accounts, "Uses", "JSON/HTTPS")
	 * 
	 *     Rel(ma, sign, "Uses", "JSON/HTTPS")
	 *     Rel(ma, accounts, "Uses", "JSON/HTTPS")
	 * 
	 *     UpdateRelStyle(spa, sign, $offsetY="-40") 
	 *     UpdateRelStyle(spa, accounts, $offsetX="40", $offsetY="40")
	 * 
	 *     UpdateRelStyle(ma, sign, $offsetX="-90", $offsetY="40")
	 *     UpdateRelStyle(ma, accounts, $offsetY="-40")
	 * 
	 *         UpdateRelStyle(sign, security, $offsetX="-160", $offsetY="10")
	 *         UpdateRelStyle(accounts, mbsfacade, $offsetX="140", $offsetY="10")
	 *         UpdateRelStyle(security, db, $offsetY="-40")
	 *         UpdateRelStyle(mbsfacade, mbs, $offsetY="-40")
	 * ```
	*/
	diagram() {
		
	}
}